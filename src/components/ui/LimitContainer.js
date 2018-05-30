import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';

// Redux
import { connect } from 'react-redux';

import { setLimit } from 'reducers/widgetEditor';

// Maximum value for the query limit
const LIMIT_MAX_VALUE = 500;

class LimitContainer extends React.Component {
  @Autobind
  handleLimitChange(newLimit) {
    // We round the number to an integer
    let limit = Math.round(newLimit);

    // We also restrict it to [[1, LIMIT_MAX_VALUE]]
    limit = Math.max(Math.min(limit, LIMIT_MAX_VALUE), 1);

    this.props.setLimit(limit);
  }

  render() {
    return (
      <div className="c-we-limit-container">
        <label htmlFor="we-filter-limit" className="text">
          Max rows
          <input
            id="we-filter-limit"
            type="number"
            step="1"
            min="1"
            max={LIMIT_MAX_VALUE}
            value={this.props.limit}
            onChange={e => this.handleLimitChange(e.target.value)}
          />
        </label>
      </div>
    );
  }
}

LimitContainer.propTypes = {
  // Store
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  limit: state.widgetEditor.limit
});

const mapDispatchToProps = dispatch => ({
  setLimit: limit => dispatch(setLimit(limit))
});

export default connect(mapStateToProps, mapDispatchToProps)(LimitContainer);
