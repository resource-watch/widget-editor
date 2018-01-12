import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';
import getQueryByFilters from 'helpers/getQueryByFilters';

class EmbedTableModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
  }

  onCopyClick() {
    const copyTextarea = this.input;
    copyTextarea.select();

    try {
      document.execCommand('copy');
      this.setState({ copied: true });
    } catch (err) {
      toastr.warning('Oops, unable to copy');
    }
  }

  /**
   * Return the queryUrl part of the embed URL
   * @returns {string}
   */
  getQueryUrl() {
    const { widgetEditor } = this.props;
    const {
      filters,
      fields,
      value,
      aggregateFunction,
      category,
      orderBy,
      limit,
      areaIntersection,
      tableName,
      datasetId
    } = widgetEditor;

    const aggregateFunctionExists = aggregateFunction && aggregateFunction !== 'none';
    const arrColumns = fields.map((val) => {
      // Value
      if (value && value.name === val.columnName && aggregateFunctionExists) {
        return { value: val.columnName, key: val.columnName, aggregateFunction, group: false };
      }

      // Category
      if (category && category.name === val.columnName && aggregateFunctionExists) {
        return { value: val.columnName, key: val.columnName, group: true };
      }

      // Rest of columns
      return {
        value: val.columnName,
        key: val.columnName,
        remove: aggregateFunctionExists
      };
    }).filter(val => !val.remove);

    const orderByColumn = orderBy ? [orderBy] : [];
    if (orderByColumn.length > 0 && value && orderByColumn[0].name === value.name
      && aggregateFunction && aggregateFunction !== 'none') {
      orderByColumn[0].name = `${aggregateFunction}(${value.name})`;
    }

    const sortOrder = orderBy ? orderBy.orderType : 'asc';
    const query = `${getQueryByFilters(tableName, filters, arrColumns, orderByColumn, sortOrder)} LIMIT ${limit}`;
    const geostore = areaIntersection ? `&geostore=${areaIntersection}` : '';

    return `${getConfig().url}/query/${datasetId}?sql=${query}${geostore}`;
  }

  render() {
    const url = `${this.props.baseUrl}?queryURL=${this.getQueryUrl()}`;
    const iframeText = `<iframe src="${url}" width="100%" height="474" frameBorder="0"></iframe>`;
    return (
      <div className="c-we-embed-table-modal">
        <h2>Share into my web</h2>
        <p>You may include this content on your webpage. To do this, copy the following html
        code and insert it into the source code of your page:</p>
        <div className="url-container">
          <input ref={(n) => { this.input = n; }} value={iframeText} className="url" readOnly />
          <button type="button" className="c-we-btn -primary" onClick={() => this.onCopyClick()}>
            Copy
          </button>
        </div>
      </div>
    );
  }
}

EmbedTableModal.propTypes = {
  /**
   * Base URL of the embed page
   * At the end of that URL will be added "?queryURL=xxx"
   */
  baseUrl: PropTypes.string.isRequired,
  widgetEditor: PropTypes.object
};

const mapStateToProps = state => ({
  widgetEditor: state.widgetEditor
});

export default connect(mapStateToProps, null)(EmbedTableModal);
