import React, { PropTypes } from 'react';
import classnames from 'classnames';
import './style.scss';

const InputText = ({ expanded, theme, bottomSpace = true, className, hasError, ...props }) => {
  const inputTextClassName = classnames(
    'm-input-text',
    {
      'm-input-text--expanded': expanded,
      'm-input-text--light': theme === 'light',
      'm-input-text--bottom-space': bottomSpace,
      'm-input-text--error': hasError,
    },
    className
  );

  return (
    <input
      type="text"
      className={inputTextClassName}
      {...props}
    />
  );
};

InputText.propTypes = {
  expanded: PropTypes.bool,
  theme: PropTypes.string,
  bottomSpace: PropTypes.bool,
  hasError: PropTypes.bool,
  className: PropTypes.string,
};

export default InputText;
