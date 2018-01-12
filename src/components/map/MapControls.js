import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function MapControls({ children, className }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <div className={`c-we-map-controls ${classNames}`}>
      <ul className="map-controls-list">
        {React.Children.map(children, (ch, i) => (
          <li className="map-controls-item" key={i}>
            {ch}
          </li>
        ))}
      </ul>
    </div>
  );
}

MapControls.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
};
