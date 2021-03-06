import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import axios from 'axios';
import ResetPasswordForm from '../../components/ResetPasswordForm';


class ResetPassword extends Component {
  static propTypes = {
    __: PropTypes.func.isRequired,
  };

  state = {
    errors: {},
    isSuccess: false,
  };

  /* handleError = () => {} */

  handleSuccess = () => {
    this.setState({ isSuccess: true });
  }

  handleResetPassword = (/* ev */) => {
    // TODO: process reset password form

    /* axios.post('/auth/reset-password', {
      ...ev.formValues,
    }, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }).then(this.handleSuccess, this.handleError);
    */
  }

  render() {
    return (
      <ResetPasswordForm
        onSubmit={this.handleSuccess} // should be this.handleResetPassword
        errors={this.state.errors}
        success={this.state.isSuccess}
      />
    );
  }
}

export default ResetPassword;
