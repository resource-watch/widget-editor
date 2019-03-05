import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';

// Redux
import { connect } from 'react-redux';

// Components
import Spinner from 'components/ui/Spinner';

// Services
import DatasetService from 'services/DatasetService';

// Helpers
import getQueryByFilters from 'helpers/getQueryByFilters';

class TableView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: null
    };

    // DatasetService
    this.datasetService = new DatasetService(props.datasetId);
  }

  /**
  * COMPONENT LIFECYCLE
  * - componentDidMount
  * - componentWillReceiveProps
  */
  componentDidMount() {
    this.getDataForTable(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.getDataForTable(nextProps);
  }

  getDataForTable(props) {
    const { tableName, datasetProvider, widgetEditor } = props;
    const {
      areaIntersection,
      filters,
      fields,
      value,
      aggregateFunction,
      category,
      orderBy,
      limit
    } = widgetEditor;
    const aggregateFunctionExists = aggregateFunction && aggregateFunction !== 'none';

    const arrColumns = fields.filter(val => val.columnName !== 'cartodb_id' && val.columnType !== 'geometry').map(
      (val) => {
        if (value && value.name === val.columnName && aggregateFunctionExists) {
          // Value
          return { value: val.columnName, key: val.columnName, aggregateFunction, group: false };
        } else if (category && category.name === val.columnName && aggregateFunctionExists) {
          // Category
          return { value: val.columnName, key: val.columnName, group: true };
        } else { // eslint-disable-line
          // Rest of columns
          return {
            value: val.columnName,
            key: val.columnName,
            remove: aggregateFunctionExists
          };
        }
      }
    ).filter(val => !val.remove);

    const orderByColumn = orderBy ? [orderBy] : [];
    if (orderByColumn.length > 0 && value && orderByColumn[0].name === value.name && aggregateFunction && aggregateFunction !== 'none') {
      orderByColumn[0] = Object.assign({}, orderByColumn[0], { name: `${aggregateFunction}(${value.name})` });
    }

    const geostore = areaIntersection ? `&geostore=${areaIntersection}` : '';

    const sortOrder = orderBy ? orderBy.orderType : 'asc';
    const query = `sql=${getQueryByFilters(tableName, datasetProvider, filters, arrColumns, orderByColumn, sortOrder)} LIMIT ${limit} ${geostore}`;

    this.setState({ loading: true });
    this.datasetService.fetchFilteredData(query).then((response) => {
      this.setState({
        data: response,
        loading: false
      });
    }).catch(err => toastr.error('Error', err));
  }

  render() {
    const { loading, data } = this.state;
    const { fields } = this.props.widgetEditor;

    let header = data && data.length > 0
      ? Object.keys(data[0])
      : [];

    // We check if we have an alias for the column name
    // and update the headers accordingly
    header = header.map((value) => {
      const field = fields.find(f => f.columnName === value);
      if (field) return field.alias || value;
      return value;
    });

    return (
      <div className="c-we-table-view c-we-table">
        <Spinner
          isLoading={loading}
          className="-light"
        />
        <table>
          <thead>
            <tr>
              {header.map(val => (
                <th
                  key={`header_${val}`}
                >
                  {val}
                </th>
              ))
              }
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((row, i) =>
                (
                  <tr
                    key={`row${i}`} // eslint-disable-line
                  >
                    {
                      Object.keys(row).map(column => (<td key={`td${column}`}>{row[column]}</td>))
                    }
                  </tr>
                )
              )
            }
          </tbody>
        </table>
      </div>
    );
  }
}

TableView.propTypes = {
  /**
   * Dataset ID
   */
  datasetId: PropTypes.string.isRequired,
  datasetProvider: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  tableName: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  // Store
  widgetEditor: PropTypes.object.isRequired // eslint-disable-line react/no-unused-prop-types
};

const mapStateToProps = ({ widgetEditor }) => ({ widgetEditor });

export default connect(mapStateToProps, null)(TableView);
