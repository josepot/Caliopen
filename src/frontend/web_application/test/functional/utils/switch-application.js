// TODO: not verified because not used yet
module.exports = {
  switch: (application) => {
    if (application !== 'discussions') {
      throw new Error(`Switch app "${application}" not yet implemented`);
    }

    // TODO fix switch app
    return element(by.css('.l-header__brand a')).click();

    // const appSwitcherElement = element(by.css('.m-application-switcher'));
    //
    // const currentAppElement = appSwitcherElement.element(by.cssContainingText('.m-link', application));
    //
    // if (currentAppElement) {
    //   currentAppElement.click();
    //
    //   return;
    // }
    //
    // appSwitcherElement
    //   .element(by.css('a[data-toggle="co-application-switcher"]'))
    //   .click();
    // appSwitcherElement
    //   .element(by.cssContainingText('.m-application-switcher__dropdown .m-link', application))
    //   .click();
  },
};
