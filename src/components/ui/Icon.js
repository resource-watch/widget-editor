import React from 'react';
import PropTypes from 'prop-types';

export default function Icon({ name, className }) {
  return (
    <svg className={`c-we-icon ${className || ''}`}>
      <use xlinkHref={`#editor-${name}`} />
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
};
