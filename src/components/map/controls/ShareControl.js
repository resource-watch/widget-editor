import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { toggleModal, setModalOptions } from 'reducers/modal';

// Components
import ShareModalExplore from 'components/modal/ShareModalExplore';
import Icon from 'components/ui/Icon';

class ShareControl extends React.Component {
  handleShareModal() {
    const options = {
      children: ShareModalExplore,
      childrenProps: {
        ...this.props,
        url: window.location.href,
        toggleModal: this.props.toggleModal
      }
    };
    this.props.toggleModal(true);
    this.props.setModalOptions(options);
  }

  // RENDER
  render() {
    return (
      <button type="button" className="share-button" onClick={() => this.handleShareModal()}>
        <Icon name="icon-share" className="-small" />
      </button>
    );
  }
}

ShareControl.propTypes = {
  // ACTIONS
  toggleModal: PropTypes.func,
  setModalOptions: PropTypes.func
};

export default connect(
  null,
  {
    toggleModal,
    setModalOptions
  }
)(ShareControl);
