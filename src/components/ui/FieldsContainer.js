import React from 'react';
import PropTypes from 'prop-types';
import ColumnBox from 'components/ui/ColumnBox';

const FieldsContainer = (props) => {
  const { fields } = props;
  return (
    <div className="c-we-fields-container">
      {
        fields.map(val =>
          (
            <ColumnBox
              key={val.columnName}
              name={val.columnName}
              type={val.columnType}
              description={val.description}
            />
          )
        )
      }
    </div>
  );
};

FieldsContainer.propTypes = {
  fields: PropTypes.array.isRequired
};

export default FieldsContainer;
