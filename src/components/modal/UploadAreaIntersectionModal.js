import React from 'react';
import PropTypes from 'prop-types';
import Autobind from 'autobind-decorator';
import Dropzone from 'react-dropzone';
import classnames from 'classnames';

// Components
import Spinner from 'components/ui/Spinner';

// Services
import AreasService from 'services/AreasService';

// Helpers
import { getConfig } from 'helpers/ConfigHelper';

class UploadAreaIntersectionModal extends React.Component {
  /**
   * Return the name of the file
   * @param {File} file
   * @returns {string}
   */
  static getFileName(file) {
    return file.name;
  }

  /**
   * Return the extension of the file
   * @param {File} file
   * @returns {string}
   */
  static getFileType(file) {
    return file.name.split('.').pop();
  }

  /**
   * Return the JSON object that the file represents
   * @static
   * @param {File} file JSON-compatible file
   * @returns {Promise<Object>}
   */
  static readJSONFile(file) {
    return new Promise((resolve) => {
      // We read the file and resolve the json object
      const reader = new FileReader();
      reader.onload = () => resolve(JSON.parse(reader.result));
      reader.onerror = () => {
        throw new Error('Unable to read the geojson file. Please try to upload it again.');
      };
      reader.readAsText(file);
    });
  }

  /**
   * Convert the file to the geojson format if necessary
   * and store it in the geostore
   * NOTE: the method doesn't catch the errors but sends
   * comprehensive errors
   * @static
   * @param {File} file File to process
   * @returns {Promise<string>} hash Hash of the store file
   */
  static processFile(file) {
    const areaService = new AreasService();
    // First step: we convert the file to a geojson format
    return new Promise((resolve, reject) => {
      const fileType = UploadAreaIntersectionModal.getFileType(file);

      // If the file is already a geojson, we don't need to convert it
      if (fileType === 'geojson') {
        // If there's an error, it will be caught at a higher level
        UploadAreaIntersectionModal.readJSONFile(file)
          .then(resolve)
          .catch(reject);
      } else { // Otherwise, we convert it
        // If there's an error, it will be caught at a higher level
        areaService.convertToJSON(file)
          .then(resolve)
          .catch(reject);
      }
    })
      // Second: we store it in the geostore and return its id
      .then(geojson => areaService.createArea(geojson));
  }

  constructor(props) {
    super(props);

    this.state = {
      accepted: null, // Accepted file
      rejected: null, // Rejected file
      dropzoneActive: false,
      loading: false,
      errors: []
    };
  }

  /**
   * Event handler executed when the user drags a file over the
   * drop zone
   */
  @Autobind
  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  /**
   * Event handler executed when the user drags a file over the
   * drop zone
   */
  @Autobind
  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  /**
   * Event handler executed when the user drops a file in the
   * drop zone
   * @param {File[]} accepted List of accepted files
   * @param {File[]} rejected List of rejected files
   */
  @Autobind
  onDrop(accepted, rejected) {
    this.setState({
      accepted: accepted[0],
      rejected: rejected[0],
      dropzoneActive: false,
      loading: true,
      errors: []
    }, () => {
      if (this.state.accepted) {
        UploadAreaIntersectionModal.processFile(this.state.accepted)
          .then(id => this.props.onUploadArea(id))
          .catch(err => this.setState({ errors: [err] }))
          .then(() => this.setState({ loading: false }));
      }
    });
  }

  /**
   * Event handler executed when the user clicks on the drop
   * zone
   */
  @Autobind
  onOpenDialog() {
    this.dropzone.open();
  }

  render() {
    const { dropzoneActive, loading, errors } = this.state;

    let fileInputContent = 'Select a file';
    if (dropzoneActive) {
      fileInputContent = 'Drop the file here';
    } else if (this.state.accepted) {
      fileInputContent = UploadAreaIntersectionModal.getFileName(this.state.accepted);
    }

    const description = (
      <div>
        <p>
          Drop a file in the designated area or click the button to upload it.
          The recommended <strong>maximum file size is 1MB</strong>.
          Anything larger than that may not work properly.
        </p>
        <p>
          If you want to draw the area, you can use&nbsp;
          <a href="http://geojson.io" target="_blank" rel="noopener noreferrer">geojson.io</a>
          &nbsp;and download a file with one of the supported format below.
        </p>
      </div>
    );

    return (
      <div className={classnames('c-we-upload-area-intersection-modal', { '-embed': this.props.embed })}>
        <Spinner isLoading={loading} className="-light" />
        { !this.props.embed && <h2>Upload a new area</h2> }

        <Dropzone
          ref={(node) => { this.dropzone = node; }}
          className="c-we-dropzone"
          activeClassName="-active"
          rejectClassName="-reject"
          multiple={false}
          disableClick
          disablePreview
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >

          { !this.props.embed && description }

          <div className={classnames({ 'dropzone-file-input': true, '-active': dropzoneActive })}>
            <div
              role="presentation"
              className="dropzone-file-name"
              onClick={this.onOpenDialog}
            >
              { fileInputContent }
            </div>
            <button
              className="c-we-button"
              type="button"
              onClick={this.onOpenDialog}
            >
              Select file
            </button>
          </div>

          {!!errors.length &&
            <ul className="dropzone-file-errors">
              {errors.map((err, index) =>
                <li key={err}>{index === 0 && <span>Error</span>} {err.message}</li>
              )}
            </ul>
          }

          <div className="info">
            { this.props.embed && description }

            <div className="complementary-info">
              <p>
                List of supported file formats:
              </p>
              <ul>
                <li>
                  Unzipped: <strong>.csv</strong> (must contain a geom column that contains geographic information), <strong>.geojson</strong>, <strong>.kml</strong>, <strong>.kmz</strong>, <strong>.wkt</strong>
                </li>
                <li>
                  Zipped: <strong>.shp</strong> (must include the .shp, .shx, .dbf and .prj files)
                </li>
              </ul>
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }
}

UploadAreaIntersectionModal.propTypes = {
  // Callback to call with the id of the area
  onUploadArea: PropTypes.func.isRequired,
  // Whether this component is embedded somewhere (not in a modal)
  embed: PropTypes.bool
};

UploadAreaIntersectionModal.defaultProps = {
  embed: false
};

export default UploadAreaIntersectionModal;
