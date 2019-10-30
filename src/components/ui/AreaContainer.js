import React from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import Autobind from 'autobind-decorator';
import { connect } from 'react-redux';

// Components
import CustomSelect from 'components/ui/CustomSelect';
import Spinner from 'components/ui/Spinner';
import UploadAreaIntersectionModal from 'components/modal/UploadAreaIntersectionModal';

// Redux
import { toggleModal } from 'reducers/modal';
import { setAreaIntersection } from 'reducers/widgetEditor';

// Services
import AreasService from 'services/AreasService';
import UserService from 'services/UserService';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

const AREAS = [
  {
    label: 'Custom area',
    value: 'custom',
    items: [
      {
        label: 'Upload new area',
        value: 'upload',
        as: 'Custom area'
      }
    ]
  }
];

class AreaContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      areaOptions: AREAS,
      loading: true
    };

    // Services
    this.areasService = new AreasService();
    this.userService = new UserService(getConfig().userToken);
  }

  componentDidMount() {
    let error = false;

    this.fetchAreas()
      .catch(() => { error = true; })
      .then(() => this.fetchUserAreas())
      .catch(() => { error = true; })
      .then(() => this.setState({ loading: false }))
      .then(() => {
        if (error) {
          toastr.error('Area intersection', 'Some of the options of the area filter failed to load. You might want to reload the page to try to load them again.');
        }
      });
  }

  /**
   * Callback handler executed when the selected area
   * intersection is changed
   * @param {{ label: string, value: string }} item Option of the selector
   * @return {Promise<boolean>}
   */
  @Autobind
  async onChangeAreaIntersection(item) {
    return new Promise((resolve) => {
      // The user unselected the option
      if (!item) {
        this.props.setAreaIntersection(null);
      } else if (item.value === 'upload') {
        this.props.toggleModal(true, {
          children: UploadAreaIntersectionModal,
          childrenProps: {
            onUploadArea: (id) => {
              // We close the modal
              this.props.toggleModal(false, {});

              // We save the ID of the area
              this.props.setAreaIntersection(id);

              resolve(true);
            }
          },
          onCloseModal: () => resolve(false)
        });
      } else {
        // The user selected a custom area that is not a country
        this.props.setAreaIntersection(item.id);
        resolve(true);
      }
    });
  }

  /**
   * Fetch the list of the areas for the area intersection
   * filter
  */
  fetchAreas() {
    return this.areasService.fetchCountries()
      .then((data) => {
        this.setState({
          areaOptions: [...this.state.areaOptions, ...AREAS,
            ...data.map(elem => ({
              label: elem.name || '',
              id: elem.geostoreId,
              value: `country-${elem.geostoreId}`
            }))]
        });
      });
  }

  /**
   * Fetch the areas of the logged user
   */
  fetchUserAreas() {
    if (!getConfig().userToken) {
      return Promise.resolve();
    }

    return this.userService.getUserAreas()
      .then((response) => {
        const userAreas = response.map(val => ({
          label: val.attributes.name,
          id: val.attributes.geostore,
          value: `user-area-${val.attributes.geostore}`
        }));
        this.setState({
          areaOptions: [...this.state.areaOptions, ...userAreas]
        });
      });
  }

  render() {
    const { required, areaIntersection } = this.props;
    const { loading, areaOptions } = this.state;

    // We retrieve the selected option
    let selectedArea = areaIntersection && !loading
      && areaOptions.find(opt => opt.id === areaIntersection);
    selectedArea = selectedArea && selectedArea.value;

    return (
      <div className="c-we-area-container">
        <label htmlFor="we-filter-area" className="text">
          Filter by area{ required ? ' *' : '' } { loading && <Spinner isLoading className="-light -small -inline" /> }
          <CustomSelect
            id="we-filter-area"
            placeholder="Select area"
            options={areaOptions}
            value={selectedArea}
            onValueChange={this.onChangeAreaIntersection}
            allowNonLeafSelection={false}
            waitForChangeConfirmation
          />
        </label>
      </div>
    );
  }
}

AreaContainer.propTypes = {
  required: PropTypes.bool,
  // Store
  areaIntersection: PropTypes.string,
  toggleModal: PropTypes.func.isRequired,
  setAreaIntersection: PropTypes.func.isRequired
};

AreaContainer.defaultProps = {
  required: false
};

const mapStateToProps = ({ widgetEditor }) => ({
  areaIntersection: widgetEditor.areaIntersection
});

const mapDispatchToProps = dispatch => ({
  toggleModal: (open, opts) => { dispatch(toggleModal(open, opts)); },
  setAreaIntersection: id => dispatch(setAreaIntersection(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(AreaContainer);
