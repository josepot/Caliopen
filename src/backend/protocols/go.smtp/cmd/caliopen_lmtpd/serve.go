package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/spf13/cobra"

	"github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp"
	"github.com/flashmob/go-guerrilla"
)

var (
	configPath string
	pidFile    string

	serveCmd = &cobra.Command{
		Use:   "serve",
		Short: "start the caliopen LMTP server",
		Run:   serve,
	}

	cmdConfig     = CmdConfig{}
	signalChannel = make(chan os.Signal, 1) // for trapping SIG_HUP
)

func init() {
	serveCmd.PersistentFlags().StringVarP(&configPath, "config", "c",
		"caliopen_lmtpd.conf", "Path to the configuration file")
	serveCmd.PersistentFlags().StringVarP(&pidFile, "pid-file", "p",
		"/var/run/caliopen_lmtpd.pid", "Path to the pid file")

	rootCmd.AddCommand(serveCmd)
}

func sigHandler(app guerrilla.Guerrilla, lda *lda.CaliopenLDA) {
	// handle SIGHUP for reloading the configuration while running
	signal.Notify(signalChannel, syscall.SIGHUP, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGINT, syscall.SIGKILL)

	for sig := range signalChannel {

		if sig == syscall.SIGHUP {
			err := readConfig(configPath, verbose, &cmdConfig)
			if err != nil {
				log.WithError(err).Error("Error while ReadConfig (reload)")
			} else {
				log.Infof("Configuration is reloaded at %s", guerrilla.ConfigLoadTime)
			}
			// TODO: reinitialize
		} else if sig == syscall.SIGTERM || sig == syscall.SIGQUIT || sig == syscall.SIGINT {
			log.Infof("Shutdown signal caught")
			lda.Shutdown()
			app.Shutdown()
			log.Infof("Shutdown completd, exiting.")
			os.Exit(0)
		} else {
			os.Exit(0)
		}
	}
}

func serve(cmd *cobra.Command, args []string) {
	logVersion()

	err := readConfig(configPath, verbose, &cmdConfig)
	if err != nil {
		log.WithError(err).Fatal("Error while reading config")
	}

	// Check that max clients is not greater than system open file limit.
	fileLimit := getFileLimit()

	if fileLimit > 0 {
		maxClients := 0
		for _, s := range cmdConfig.Servers {
			maxClients += s.MaxClients
		}
		if maxClients > fileLimit {
			log.Fatalf("Combined max clients for all servers (%d) is greater than open file limit (%d). "+
				"Please increase your open file limit or decrease max clients.", maxClients, fileLimit)
		}
	}

	// Write out our PID
	if len(pidFile) > 0 {
		if f, err := os.Create(pidFile); err == nil {
			defer f.Close()
			if _, err := f.WriteString(fmt.Sprintf("%d", os.Getpid())); err == nil {
				f.Sync()
			} else {
				log.WithError(err).Fatalf("Error while writing pidFile (%s)", pidFile)
			}
		} else {
			log.WithError(err).Fatalf("Error while creating pidFile (%s)", pidFile)
		}
	}
	lda := lda.CaliopenLDA{}
	lda.Initialize(cmdConfig.LDAConfig)
	var b guerrilla.Backend
	b = guerrilla.Backend(&lda)
	app := guerrilla.New(&cmdConfig.AppConfig, &b)
	go func(){
		err := app.Start()
		if len(err) != 0 {
			log.Infof("Error(s) at startup : ", err)
		}
	}()

	sigHandler(app, &lda)
}

// Superset of `guerrilla.AppConfig` containing options specific
// the the command line interface.
type CmdConfig struct {
	guerrilla.AppConfig
	lda.LDAConfig
}

// ReadConfig which should be called at startup, or when a SIG_HUP is caught
func readConfig(path string, verbose bool, config *CmdConfig) error {
	// load in the config.
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return fmt.Errorf("Could not read config file: %s", err.Error())
	}

	err = json.Unmarshal(data, &config)
	if err != nil {
		return fmt.Errorf("Could not parse config file: %s", err.Error())
	}

	if len(config.AllowedHosts) == 0 {
		return errors.New("Empty `allowed_hosts` is not allowed")
	}

	guerrilla.ConfigLoadTime = time.Now()
	return nil
}

func getFileLimit() int {
	cmd := exec.Command("ulimit", "-n")
	out, err := cmd.Output()
	if err != nil {
		return -1
	}

	limit, err := strconv.Atoi(strings.TrimSpace(string(out)))
	if err != nil {
		return -1
	}

	return limit
}
