import React from 'react';

export default class Icons extends React.Component {
  shouldComponentUpdate() {
    // This component doesn't need to re-render because
    // everything is static
    return false;
  }

  render() {
    return (
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <symbol id="editor-icon-list-mode" viewBox="0 0 37 32">
            <title>list-mode</title>
            <path d="M0 0h36.923v14.769h-36.923v-14.769zM0 17.231h36.923v14.769h-36.923v-14.769z" />
          </symbol>
          <symbol id="editor-icon-cross" viewBox="0 0 32 32">
            <title>Cross</title>
            <path d="M16 11.636l-11.636-11.636-4.364 4.364 11.636 11.636-11.636 11.636 4.364 4.364 11.636-11.636 11.636 11.636 4.364-4.364-11.636-11.636 11.636-11.636-4.364-4.364z" />
          </symbol>
          <symbol id="editor-icon-layers" viewBox="0 0 34 32">
            <title>layers</title>
            <path d="M29.995 17.712l4.29 2.859-17.143 11.429-17.136-11.429 4.286-2.857 12.855 8.571 12.85-8.574zM34.281 11.429l-17.136 11.429-17.145-11.429 17.143-11.429 17.138 11.429z" />
          </symbol>
          <symbol id="editor-icon-opacity" viewBox="0 0 29 32">
            <title>opacity</title>
            <path d="M29.333 7.92c-0.761-1.345-1.646-2.503-2.667-3.526l0 0v23.211c1.040-1.040 1.939-2.224 2.667-3.525v-16.16zM21.333 0.88c-0.752-0.308-1.646-0.577-2.569-0.762l-0.098-0.016v31.797c0.92-0.179 1.813-0.443 2.667-0.779v-30.24zM13.333 32c-7.547-1.181-13.333-7.893-13.333-16s5.787-14.819 13.333-16v32z" />
          </symbol>
          <symbol id="editor-icon-hide" viewBox="0 0 47 32">
            <title>hide</title>
            <path d="M17.149 16c-0.002 0.056-0.003 0.122-0.003 0.189 0 3.384 2.743 6.127 6.127 6.127s6.127-2.743 6.127-6.127c0-0.066-0.001-0.133-0.003-0.198l0 0.010c0.002-0.056 0.003-0.122 0.003-0.189 0-3.384-2.743-6.127-6.127-6.127s-6.127 2.743-6.127 6.127c0 0.066 0.001 0.133 0.003 0.198l-0-0.010zM46.545 16c-4.46-7.948-13.204-16-23.273-16-10.045 0-18.813 8.052-23.273 16 4.46 7.948 13.228 16 23.273 16 10.068 0 18.813-8.052 23.273-16zM23.273 4.922c6.080 0 11.025 4.96 11.025 11.078s-4.945 11.078-11.025 11.078-11.025-4.96-11.025-11.078c0-6.118 4.945-11.078 11.025-11.078z" />
          </symbol>
          <symbol id="editor-icon-show" viewBox="0 0 39 32">
            <title>show</title>
            <path d="M26.905 4.994l5.125-4.994 3.481 3.392-29.356 28.608-3.481-3.392 4.076-3.973c-2.675-2.25-4.921-4.902-6.672-7.88l-0.077-0.142c3.774-6.553 11.193-13.194 19.692-13.194 2.523 0 4.948 0.583 7.212 1.575zM11.168 20.33l3.36-3.274c-0.011-0.125-0.017-0.271-0.017-0.419 0-0.009 0-0.017 0-0.026v0.001c0-2.806 2.306-5.073 5.182-5.073 0.16 0 0.32 0.007 0.475 0.020l3.36-3.274c-1.122-0.507-2.432-0.803-3.812-0.803-0.008 0-0.016 0-0.024 0h0.001c-5.145 0-9.329 4.086-9.329 9.132 0 1.324 0.288 2.58 0.805 3.717zM34.454 10.24c1.876 1.855 3.51 3.948 4.853 6.233l0.077 0.143c-3.774 6.55-11.173 13.194-19.692 13.194-1.656-0.005-3.254-0.245-4.766-0.688l0.121 0.030 3.557-3.466c0.357 0.039 0.721 0.062 1.088 0.062 5.145 0 9.329-4.089 9.329-9.132 0-0.345-0.020-0.689-0.059-1.022l5.492-5.354z" />
          </symbol>
          <symbol id="editor-icon-item-unknown" viewBox="0 0 32 32">
            <title>item-unknown</title>
            <path d="M13.692 29.77v-7.266c0-0.56 0.035-1.127 0.105-1.701s0.189-1.099 0.357-1.575c-0.364 0.392-0.77 0.742-1.218 1.050s-0.924 0.616-1.428 0.924l-6.132 3.57-3.024-4.998 6.132-3.57c0.532-0.308 1.064-0.574 1.596-0.798s1.078-0.392 1.638-0.504c-0.56-0.112-1.106-0.287-1.638-0.525s-1.064-0.511-1.596-0.819l-6.132-3.654 3.024-5.040 6.132 3.696c0.504 0.308 0.987 0.623 1.449 0.945s0.875 0.679 1.239 1.071c-0.336-0.952-0.504-2.030-0.504-3.234v-7.35h6.132v7.266c0 0.588-0.035 1.162-0.105 1.722s-0.189 1.092-0.357 1.596c0.364-0.392 0.77-0.749 1.218-1.071s0.924-0.637 1.428-0.945l6.132-3.612 3.024 5.040-6.132 3.57c-0.56 0.308-1.106 0.574-1.638 0.798s-1.078 0.392-1.638 0.504c0.56 0.112 1.113 0.287 1.659 0.525s1.085 0.511 1.617 0.819l6.132 3.654-3.024 4.998-6.132-3.654c-0.532-0.308-1.022-0.623-1.47-0.945s-0.868-0.679-1.26-1.071c0.364 0.98 0.546 2.058 0.546 3.234v7.35h-6.132z" />
          </symbol>
          <symbol id="editor-icon-item-date" viewBox="0 0 28 32">
            <title>item-date</title>
            <path d="M21.333 3.556h7.111v28.444h-28.444v-28.444h7.111v-3.556h3.556v3.556h7.111v-3.556h3.556v3.556zM3.556 14.222v14.222h21.333v-14.222h-21.333z" />
          </symbol>
          <symbol id="editor-icon-item-category" viewBox="0 0 32 32">
            <title>item-category</title>
            <path d="M0 0h11.2l20.8 20.8-11.2 11.2-20.8-20.8v-11.2zM8 11.2c1.767 0 3.2-1.433 3.2-3.2s-1.433-3.2-3.2-3.2c-1.767 0-3.2 1.433-3.2 3.2s1.433 3.2 3.2 3.2z" />
          </symbol>
          <symbol id="editor-icon-item-number" viewBox="0 0 26 32">
            <title>item-number</title>
            <path d="M17.285 23.514l-1.602 8.486h-2.35c-0.416 0-0.777-0.166-1.082-0.499s-0.458-0.742-0.458-1.227c0-0.069 0.003-0.135 0.010-0.198s0.017-0.128 0.031-0.198l1.227-6.365h-4.264l-1.206 6.614c-0.125 0.666-0.409 1.144-0.853 1.435s-0.936 0.437-1.477 0.437h-2.267l1.581-8.486h-2.392c-0.444 0-0.783-0.107-1.019-0.322s-0.354-0.572-0.354-1.071c0-0.194 0.021-0.416 0.062-0.666l0.27-1.643h3.952l1.082-5.741h-4.451l0.395-2.142c0.097-0.527 0.312-0.919 0.645-1.175s0.874-0.385 1.622-0.385h2.309l1.29-6.698c0.111-0.555 0.367-0.985 0.77-1.29s0.874-0.458 1.414-0.458h2.33l-1.581 8.445h4.243l1.602-8.445h2.288c0.485 0 0.881 0.139 1.186 0.416s0.458 0.631 0.458 1.061c0 0.139-0.007 0.243-0.021 0.312l-1.29 6.656h4.222l-0.395 2.142c-0.097 0.527-0.315 0.919-0.655 1.175s-0.877 0.385-1.612 0.385h-2.080l-1.061 5.741h2.954c0.444 0 0.78 0.107 1.009 0.322s0.343 0.579 0.343 1.092c0 0.194-0.021 0.416-0.062 0.666l-0.25 1.622h-4.514zM9.318 19.811h4.264l1.061-5.741h-4.243l-1.082 5.741z" />
          </symbol>
          <symbol id="editor-icon-logo-cms" viewBox="0 0 193 32">
            <title>logo-cms</title>
            <path d="M46.16 25.987c-0.047 0-0.095 0.021-0.145 0.064-0.111 0.097-0.221 0.18-0.331 0.249s-0.228 0.127-0.355 0.173c-0.127 0.045-0.265 0.079-0.414 0.1s-0.317 0.032-0.504 0.032c-0.307 0-0.593-0.054-0.859-0.162s-0.496-0.265-0.69-0.471c-0.194-0.206-0.348-0.458-0.46-0.756s-0.169-0.638-0.169-1.019c0-0.369 0.056-0.703 0.169-1.002s0.27-0.551 0.471-0.759c0.202-0.207 0.442-0.367 0.721-0.479s0.586-0.168 0.922-0.168c0.187 0 0.352 0.014 0.495 0.040s0.269 0.060 0.377 0.1c0.108 0.040 0.202 0.082 0.28 0.128s0.148 0.088 0.206 0.128c0.058 0.040 0.109 0.073 0.151 0.1s0.083 0.041 0.12 0.041c0.050 0 0.088-0.009 0.114-0.028s0.050-0.042 0.070-0.070l0.276-0.379c-0.26-0.239-0.557-0.428-0.892-0.567s-0.733-0.209-1.194-0.209c-0.467 0-0.895 0.076-1.282 0.228s-0.719 0.366-0.997 0.641c-0.278 0.276-0.493 0.605-0.646 0.989s-0.23 0.806-0.23 1.266c0 0.46 0.072 0.882 0.215 1.266s0.345 0.712 0.605 0.987c0.26 0.274 0.574 0.487 0.942 0.639s0.779 0.228 1.231 0.228c0.517 0 0.959-0.081 1.326-0.243s0.678-0.388 0.936-0.678l-0.333-0.354c-0.038-0.037-0.080-0.055-0.127-0.055zM53.362 24.197c0 0.457-0.075 0.877-0.223 1.259s-0.359 0.711-0.631 0.987c-0.272 0.276-0.598 0.489-0.979 0.641s-0.803 0.228-1.264 0.228c-0.462 0-0.882-0.076-1.262-0.228s-0.706-0.366-0.977-0.641c-0.272-0.276-0.482-0.605-0.631-0.987s-0.223-0.802-0.223-1.259c0-0.457 0.075-0.877 0.223-1.259s0.359-0.712 0.631-0.989c0.272-0.277 0.597-0.492 0.977-0.646s0.8-0.23 1.262-0.23c0.462 0 0.883 0.077 1.264 0.23s0.708 0.369 0.979 0.646c0.272 0.277 0.482 0.607 0.631 0.989s0.223 0.802 0.223 1.259zM52.49 24.197c0-0.375-0.053-0.712-0.158-1.010s-0.254-0.55-0.447-0.756c-0.193-0.206-0.427-0.364-0.701-0.475s-0.581-0.166-0.92-0.166c-0.336 0-0.641 0.055-0.916 0.166s-0.509 0.269-0.703 0.475c-0.194 0.206-0.344 0.458-0.449 0.756s-0.158 0.635-0.158 1.010c0 0.375 0.053 0.711 0.158 1.008s0.255 0.548 0.449 0.754c0.194 0.206 0.429 0.364 0.703 0.473s0.58 0.164 0.916 0.164c0.339 0 0.646-0.055 0.92-0.164s0.508-0.267 0.701-0.473c0.193-0.206 0.342-0.457 0.447-0.754s0.158-0.633 0.158-1.008zM54.754 21.141h-0.438v6.108h0.745v-4.352c0-0.057-0.001-0.119-0.004-0.188s-0.007-0.138-0.013-0.209l3.633 4.599c0.044 0.054 0.088 0.092 0.134 0.115s0.102 0.034 0.169 0.034h0.429v-6.108h-0.745v4.326c0 0.065 0.001 0.133 0.004 0.202s0.009 0.141 0.018 0.215l-3.637-4.603c-0.047-0.057-0.088-0.094-0.125-0.113s-0.093-0.028-0.169-0.028zM65.011 21.141h-4.917v0.695h2.038v5.413h0.85v-5.413h2.029v-0.695zM69.567 21.141h-3.869v6.108h3.869v-0.673h-3.015v-2.084h2.441v-0.648h-2.441v-2.029h3.015v-0.673zM71.020 21.141h-0.438v6.108h0.745v-4.352c0-0.057-0.001-0.119-0.004-0.188s-0.007-0.138-0.013-0.209l3.633 4.599c0.044 0.054 0.088 0.092 0.134 0.115s0.102 0.034 0.169 0.034h0.429v-6.108h-0.745v4.326c0 0.065 0.001 0.133 0.004 0.202s0.009 0.141 0.018 0.215l-3.637-4.603c-0.047-0.057-0.088-0.094-0.125-0.113s-0.093-0.028-0.169-0.028zM81.277 21.141h-4.917v0.695h2.038v5.413h0.85v-5.413h2.029v-0.695zM86.536 25.041l-2.169-3.759c-0.038-0.065-0.077-0.105-0.118-0.119s-0.099-0.021-0.175-0.021h-0.627v6.108h0.745v-4.488c0-0.060-0.002-0.125-0.007-0.196s-0.011-0.143-0.020-0.217l2.2 3.832c0.073 0.128 0.175 0.192 0.307 0.192h0.123c0.131 0 0.234-0.064 0.307-0.192l2.152-3.819c-0.006 0.071-0.010 0.141-0.013 0.209s-0.004 0.132-0.004 0.192v4.488h0.745v-6.108h-0.627c-0.076 0-0.134 0.007-0.175 0.021s-0.080 0.054-0.118 0.119l-2.125 3.755c-0.041 0.074-0.077 0.147-0.11 0.22s-0.063 0.148-0.092 0.228c-0.029-0.077-0.059-0.153-0.090-0.228s-0.066-0.147-0.107-0.215zM96.469 27.249h-0.657c-0.076 0-0.137-0.018-0.184-0.055s-0.082-0.084-0.105-0.141l-0.587-1.475h-2.818l-0.587 1.475c-0.020 0.051-0.055 0.097-0.105 0.136s-0.111 0.060-0.184 0.060h-0.657l2.511-6.108h0.863l2.511 6.108zM92.354 24.981h2.344l-0.986-2.485c-0.064-0.153-0.127-0.345-0.188-0.575-0.032 0.116-0.064 0.224-0.094 0.322s-0.061 0.184-0.090 0.258l-0.986 2.48zM97.492 21.141h-0.438v6.108h0.745v-4.352c0-0.057-0.001-0.119-0.004-0.188s-0.007-0.138-0.013-0.209l3.633 4.599c0.044 0.054 0.088 0.092 0.134 0.115s0.102 0.034 0.169 0.034h0.429v-6.108h-0.745v4.326c0 0.065 0.001 0.133 0.004 0.202s0.009 0.141 0.018 0.215l-3.637-4.603c-0.047-0.057-0.088-0.094-0.125-0.113s-0.093-0.028-0.169-0.028zM108.639 27.249h-0.657c-0.076 0-0.137-0.018-0.184-0.055s-0.082-0.084-0.105-0.141l-0.587-1.475h-2.818l-0.587 1.475c-0.020 0.051-0.055 0.097-0.105 0.136s-0.111 0.060-0.184 0.060h-0.657l2.511-6.108h0.863l2.511 6.108zM104.524 24.981h2.344l-0.986-2.485c-0.064-0.153-0.127-0.345-0.188-0.575-0.032 0.116-0.064 0.224-0.094 0.322s-0.061 0.184-0.090 0.258l-0.986 2.48zM111.84 26.648c-0.339 0-0.649-0.055-0.929-0.166s-0.523-0.271-0.727-0.482c-0.204-0.21-0.363-0.467-0.475-0.769s-0.169-0.647-0.169-1.034c0-0.369 0.054-0.703 0.162-0.999s0.263-0.55 0.465-0.759c0.202-0.209 0.445-0.369 0.732-0.482s0.606-0.168 0.96-0.168c0.242 0 0.452 0.018 0.629 0.055s0.33 0.082 0.46 0.134c0.13 0.053 0.24 0.107 0.331 0.164s0.172 0.105 0.245 0.145c0.055 0.031 0.107 0.047 0.153 0.047 0.079 0 0.143-0.038 0.193-0.115l0.241-0.375c-0.134-0.119-0.279-0.227-0.434-0.322s-0.324-0.176-0.506-0.243c-0.183-0.067-0.38-0.118-0.594-0.153s-0.444-0.053-0.692-0.053c-0.491 0-0.934 0.075-1.33 0.226s-0.733 0.363-1.012 0.637c-0.279 0.274-0.494 0.603-0.644 0.987s-0.226 0.808-0.226 1.274c0 0.46 0.077 0.882 0.23 1.266s0.367 0.712 0.642 0.987c0.275 0.274 0.602 0.487 0.982 0.639s0.798 0.228 1.253 0.228c0.26 0 0.501-0.014 0.723-0.041s0.43-0.068 0.624-0.124c0.194-0.055 0.377-0.124 0.548-0.207s0.335-0.179 0.493-0.29v-2.344h-1.928v0.469c0 0.045 0.017 0.084 0.050 0.115s0.078 0.047 0.134 0.047h0.973v1.347c-0.111 0.057-0.222 0.107-0.333 0.151s-0.229 0.082-0.355 0.113c-0.126 0.031-0.259 0.055-0.401 0.070s-0.297 0.023-0.467 0.023zM119.135 21.141h-3.869v6.108h3.869v-0.673h-3.015v-2.084h2.441v-0.648h-2.441v-2.029h3.015v-0.673zM121.083 24.7h0.644c0.117 0 0.204 0.015 0.263 0.045s0.112 0.079 0.162 0.147l1.63 2.182c0.073 0.116 0.187 0.175 0.342 0.175h0.754l-1.832-2.425c-0.082-0.114-0.175-0.2-0.28-0.26 0.242-0.054 0.459-0.134 0.651-0.239s0.353-0.232 0.486-0.381c0.133-0.149 0.234-0.318 0.305-0.505s0.105-0.389 0.105-0.605c0-0.259-0.045-0.492-0.136-0.701s-0.23-0.387-0.418-0.535c-0.188-0.148-0.427-0.261-0.716-0.339s-0.632-0.117-1.030-0.117h-1.775v6.108h0.846v-2.549zM121.083 24.099v-2.306h0.929c0.488 0 0.855 0.092 1.102 0.277s0.37 0.459 0.37 0.823c0 0.179-0.032 0.342-0.096 0.49s-0.16 0.275-0.287 0.381c-0.127 0.107-0.285 0.189-0.473 0.247s-0.407 0.087-0.655 0.087h-0.89zM50.060 9.551c-0.46 0.624-1.131 1.036-2.016 1.203l3.183 5.349h-3.307l-2.617-5.157h-1.185v5.157h-2.753v-12.693h4.663c0.637 0 1.241 0.079 1.813 0.204s1.072 0.35 1.503 0.641c0.43 0.292 0.772 0.684 1.026 1.177 0.253 0.493 0.38 1.109 0.38 1.846 0 0.892-0.23 1.65-0.69 2.274zM55.131 10.946v2.38h5.899v2.777h-8.652v-12.693h8.259v2.777h-5.506v1.983h5.506v2.777h-5.506zM69.43 9.417c0.43 0.261 0.787 0.612 1.070 1.052s0.424 1.029 0.424 1.766c0 0.701-0.13 1.313-0.389 1.837s-0.61 0.958-1.052 1.302-0.955 0.6-1.538 0.766c-0.583 0.167-1.2 0.25-1.848 0.25-0.814 0-1.568-0.125-2.263-0.374s-1.344-0.654-1.945-1.213l1.962-2.175c0.283 0.38 0.639 0.675 1.070 0.882 0.43 0.209 0.875 0.313 1.335 0.313 0.224 0 0.451-0.027 0.681-0.081s0.436-0.134 0.619-0.241 0.33-0.243 0.442-0.41c0.112-0.167 0.168-0.363 0.168-0.589 0-0.38-0.145-0.68-0.433-0.9s-0.651-0.407-1.087-0.562-0.908-0.309-1.414-0.464c-0.507-0.154-0.979-0.363-1.415-0.624s-0.799-0.607-1.087-1.034c-0.289-0.428-0.433-0.993-0.433-1.694 0-0.678 0.133-1.272 0.398-1.783s0.619-0.939 1.061-1.284c0.442-0.344 0.952-0.603 1.529-0.775s1.173-0.259 1.786-0.259c0.707 0 1.391 0.101 2.051 0.303s1.256 0.541 1.786 1.016l-1.892 2.086c-0.224-0.285-0.528-0.496-0.911-0.633s-0.745-0.205-1.087-0.205c-0.201 0-0.407 0.024-0.619 0.071s-0.413 0.122-0.601 0.223c-0.188 0.101-0.342 0.235-0.46 0.401s-0.177 0.369-0.177 0.606c0 0.381 0.141 0.672 0.424 0.874s0.639 0.374 1.070 0.517c0.43 0.143 0.893 0.285 1.388 0.428s0.958 0.345 1.388 0.607zM83.425 4.914c0.602 0.577 1.070 1.275 1.406 2.096s0.504 1.736 0.504 2.746c0 1.011-0.168 1.926-0.504 2.746s-0.805 1.519-1.406 2.096c-0.601 0.577-1.314 1.019-2.139 1.328s-1.727 0.464-2.705 0.464c-0.978 0-1.88-0.155-2.705-0.464s-1.538-0.752-2.139-1.328-1.070-1.275-1.406-2.096c-0.335-0.82-0.504-1.735-0.504-2.746s0.168-1.926 0.504-2.746c0.336-0.821 0.805-1.519 1.406-2.096s1.314-1.019 2.139-1.329c0.825-0.309 1.727-0.464 2.705-0.464s1.88 0.155 2.705 0.464c0.825 0.309 1.538 0.752 2.139 1.329zM94.459 11.094v-7.684h2.753v7.791c0 0.749-0.076 1.439-0.299 2.069s-0.52 1.177-0.962 1.641c-0.442 0.464-0.996 0.826-1.656 1.088s-1.425 0.392-2.285 0.392c-0.872 0-1.647-0.131-2.307-0.392s-1.228-0.624-1.67-1.088-0.81-1.011-1.034-1.641c-0.224-0.63-0.405-1.32-0.405-2.069v-7.791h2.753v7.684c0 0.392 0.133 0.755 0.257 1.088s0.369 0.621 0.593 0.865c0.224 0.244 0.491 0.434 0.803 0.571s0.649 0.205 1.015 0.205c0.365 0 0.697-0.068 1.003-0.205s0.563-0.327 0.787-0.571c0.224-0.244 0.38-0.532 0.504-0.865s0.151-0.696 0.151-1.088zM108.233 9.551c-0.46 0.624-1.131 1.036-2.016 1.203l3.183 5.349h-3.307l-2.617-5.157h-1.545v5.157h-2.753v-12.693h5.022c0.637 0 1.241 0.079 1.813 0.204s1.073 0.35 1.503 0.641c0.43 0.292 0.772 0.684 1.026 1.177 0.253 0.493 0.38 1.109 0.38 1.846 0 0.892-0.23 1.65-0.689 2.274zM117.569 13.465c0.436-0.238 0.796-0.57 1.079-0.998l2.299 1.73c-0.531 0.749-1.203 1.302-2.016 1.659s-1.651 0.535-2.511 0.535c-0.978 0-1.88-0.155-2.705-0.464s-1.538-0.752-2.139-1.328-1.070-1.275-1.406-2.096c-0.335-0.82-0.504-1.735-0.504-2.746s0.168-1.926 0.504-2.746c0.336-0.821 0.805-1.519 1.406-2.096s1.314-1.019 2.139-1.329c0.825-0.309 1.727-0.464 2.705-0.464 0.354 0 0.722 0.033 1.105 0.098s0.76 0.17 1.131 0.312c0.372 0.142 0.728 0.333 1.070 0.571s0.648 0.529 0.919 0.874l-2.122 1.748c-0.271-0.333-0.604-0.588-0.999-0.767s-0.852-0.267-1.371-0.267-0.999 0.101-1.441 0.303c-0.442 0.203-0.825 0.485-1.149 0.847s-0.578 0.794-0.76 1.293c-0.183 0.499-0.274 1.040-0.274 1.623 0 0.595 0.091 1.139 0.274 1.632s0.433 0.921 0.752 1.284c0.318 0.363 0.692 0.645 1.122 0.847s0.893 0.303 1.388 0.303c0.566 0 1.067-0.119 1.503-0.357zM124.742 10.946v2.38h6.293v2.777h-9.046v-12.693h8.652v2.777h-5.899v1.983h5.506v2.777h-5.506zM147.468 3.41h1.203l-3.643 12.693h-1.432l-3.165-11.107h-0.035l-3.165 11.107h-1.432l-3.642-12.693h1.202l3.112 11.107h0.035l3.165-11.107h1.485l3.165 11.107h0.035l3.112-11.107zM153.833 3.41h1.202l5.269 12.693h-1.308l-1.362-3.57h-6.631l-1.414 3.57h-1.22l5.464-12.693zM160.138 4.599v-1.19h9.832v1.19h-4.326v11.503h-1.18v-11.503h-4.326zM179.878 14.241c0.295-0.244 0.555-0.537 0.778-0.883l0.954 0.731c-0.601 0.821-1.297 1.409-2.086 1.766s-1.645 0.535-2.564 0.535c-0.954 0-1.83-0.164-2.626-0.49s-1.476-0.785-2.042-1.373c-0.566-0.589-1.008-1.29-1.326-2.105s-0.477-1.703-0.477-2.666c0-0.963 0.159-1.849 0.477-2.657s0.761-1.507 1.326-2.096c0.566-0.588 1.247-1.049 2.042-1.382s1.671-0.499 2.626-0.499c0.849 0 1.642 0.152 2.378 0.455s1.382 0.812 1.936 1.525l-0.955 0.803c-0.389-0.594-0.887-1.028-1.494-1.302-0.608-0.273-1.229-0.41-1.866-0.41-0.813 0-1.547 0.143-2.201 0.428s-1.211 0.678-1.671 1.177c-0.46 0.499-0.814 1.088-1.061 1.766s-0.371 1.409-0.371 2.194 0.124 1.516 0.371 2.194c0.248 0.678 0.602 1.266 1.061 1.766s1.017 0.892 1.671 1.177c0.654 0.286 1.388 0.428 2.201 0.428 0.319 0 0.649-0.038 0.99-0.116s0.675-0.196 0.999-0.357 0.634-0.363 0.928-0.607zM191.601 3.41h1.18v12.693h-1.18v-5.95h-7.079v5.95h-1.18v-12.693h1.18v5.553h7.079v-5.553zM10.298 5.647l7.271 7.27-10.299 10.299-7.27-7.27 10.298-10.299zM19.054 11.294l-7.133-7.133 4.161-4.161 7.133 7.133-4.161 4.161zM21.701 26.353l-7.27-7.27 10.299-10.299 7.27 7.27-10.299 10.299zM12.945 20.706l7.133 7.133-4.161 4.161-7.133-7.133 4.161-4.161zM47.665 8.062c0.147-0.19 0.221-0.458 0.221-0.803 0-0.321-0.065-0.577-0.194-0.767s-0.295-0.336-0.495-0.438c-0.2-0.101-0.43-0.171-0.69-0.207s-0.512-0.057-0.76-0.057h-1.627v2.777h1.45c0.247 0 0.509 0.042 0.787 0.024s0.527-0.020 0.752-0.109c0.223-0.090 0.409-0.229 0.557-0.419zM82.197 11.388c0.182-0.493 0.274-1.037 0.274-1.632 0-0.582-0.092-1.123-0.274-1.623s-0.445-0.93-0.787-1.293c-0.342-0.363-0.752-0.645-1.229-0.847s-1.011-0.303-1.6-0.303c-0.59 0-1.123 0.101-1.6 0.303s-0.887 0.485-1.229 0.847c-0.342 0.363-0.604 0.794-0.787 1.293s-0.274 1.040-0.274 1.623c0 0.595 0.091 1.139 0.274 1.632s0.445 0.921 0.787 1.284c0.342 0.363 0.752 0.645 1.229 0.847s1.011 0.303 1.6 0.303c0.589 0 1.122-0.101 1.6-0.303s0.887-0.485 1.229-0.847c0.342-0.363 0.604-0.791 0.787-1.284zM105.837 8.062c0.147-0.19 0.221-0.458 0.221-0.803 0-0.321-0.065-0.577-0.194-0.767s-0.295-0.336-0.495-0.438c-0.2-0.101-0.43-0.171-0.69-0.207s-0.512-0.057-0.76-0.057h-1.987v2.777h1.81c0.247 0 0.51 0.042 0.787 0.024s0.527-0.020 0.752-0.109c0.223-0.090 0.409-0.229 0.557-0.419zM151.464 11.739h5.747l-2.829-6.919-2.917 6.919z" />
          </symbol>
          <symbol id="editor-icon-arrow-down" viewBox="0 0 38 32">
            <title>arrow-down</title>
            <path d="M22.2 18.636l9.879-9.879 5.121 4.243-18 18-18-18 5.121-4.243 9.879 9.879v-17.636h6v17.636z" />
          </symbol>
          <symbol id="editor-icon-arrow-up" viewBox="0 0 38 32">
            <title>arrow-up</title>
            <path d="M22.2 13.364l9.879 9.879 5.121-4.243-18-18-18 18 5.121 4.243 9.879-9.879v17.636h6v-17.636z" />
          </symbol>
          <symbol id="editor-icon-arrow-left" viewBox="0 0 20 32">
            <title>arrow-left</title>
            <path d="M20.364 5.071l-4.364-5.071-16 16 16 16 4.364-5.071-12.143-10.929z" />
          </symbol>
          <symbol id="editor-icon-arrow-right" viewBox="0 0 20 32">
            <title>arrow-right</title>
            <path d="M0.011 26.929l4.364 5.071 16-16-16-16-4.364 5.071 12.143 10.929z" />
          </symbol>
          <symbol id="editor-icon-view-grid" viewBox="0 0 37 32">
            <title>view-grid</title>
            <path d="M4.617 4h12.923v11.077h-12.923v-11.077zM19.386 4h12.923v11.077h-12.923v-11.077zM19.386 16.923h12.923v11.077h-12.923v-11.077zM4.617 16.923h12.923v11.077h-12.923v-11.077z" />
          </symbol>
          <symbol id="editor-icon-view-list" viewBox="0 0 34 32">
            <title>view-list</title>
            <path d="M4.309 4h5.538v5.538h-5.538v-5.538zM13.539 4h16.615v5.538h-16.615v-5.538zM13.539 13.231h16.615v5.538h-16.615v-5.538zM4.309 13.231h5.538v5.538h-5.538v-5.538zM13.539 22.462h16.615v5.538h-16.615v-5.538zM4.309 22.462h5.538v5.538h-5.538v-5.538z" />
          </symbol>
          <symbol id="editor-icon-info" viewBox="0 0 32 32">
            <title>info</title>
            <path d="M18.107 14.899v-1.101h-6.603v2.201h2.201v6.603h-2.201v2.201h8.804v-2.201h-2.201v-7.703zM15.906 31.407c-8.509 0-15.407-6.898-15.407-15.407s6.898-15.407 15.407-15.407c8.509 0 15.407 6.898 15.407 15.407s-6.898 15.407-15.407 15.407zM13.705 7.196v4.402h4.402v-4.402h-4.402z" />
          </symbol>
          <symbol id="editor-icon-layers2" viewBox="0 0 34 32">
            <title>layers2</title>
            <path d="M27.616 17.497l3.643 2.503-14.556 10-14.556-10 3.641-2.501 10.916 7.501 10.913-7.503zM31.255 12l-14.553 10-14.56-10 14.56-10 14.553 10z" />
          </symbol>
          <symbol id="editor-icon-metadata" viewBox="0 0 48 32">
            <title>metadata</title>
            <path d="M20.7 7.2h19.8v4.4h-19.8v-4.4zM20.7 20.4h15.4v4.4h-15.4v-4.4zM11.9 13.8c-2.43 0-4.4-1.97-4.4-4.4s1.97-4.4 4.4-4.4c2.43 0 4.4 1.97 4.4 4.4s-1.97 4.4-4.4 4.4zM11.9 27c-2.43 0-4.4-1.97-4.4-4.4s1.97-4.4 4.4-4.4c2.43 0 4.4 1.97 4.4 4.4s-1.97 4.4-4.4 4.4z" />
          </symbol>
          <symbol id="editor-icon-widgets" viewBox="0 0 37 32">
            <title>widgets</title>
            <path d="M7.463 23v-14h6v14h-6zM15.463 23v-10h6v10h-6zM23.463 23v-20h6v20h-6zM3.463 29v-4h30v4h-30z" />
          </symbol>
          <symbol id="editor-icon-check" viewBox="0 0 32 32">
            <title>check</title>
            <path d="M28 6.667q0.573 0 0.953 0.38t0.38 0.953q0 0.563-0.385 0.948l-16 16q-0.385 0.385-0.948 0.385t-0.948-0.385l-8-8q-0.385-0.385-0.385-0.948 0-0.573 0.38-0.953t0.953-0.38q0.563 0 0.948 0.385l7.052 7.063 15.052-15.063q0.385-0.385 0.948-0.385z" />
          </symbol>
          <symbol id="editor-icon-drag-dots" viewBox="0 0 19 32">
            <title>drag-dots</title>
            <path d="M3.2 12.8c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z" />
            <path d="M16 12.8c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z" />
            <path d="M3.2 0c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z" />
            <path d="M16 0c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z" />
            <path d="M3.2 25.6c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z" />
            <path d="M16 25.6c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z" />
          </symbol>
          <symbol id="editor-icon-twitter" viewBox="0 0 33 32">
            <title>twitter</title>
            <path d="M26.446 8.727c1.058-0.793 1.851-1.851 2.38-2.909-1.058 0.529-2.116 1.058-3.438 1.322-1.058-1.322-2.38-1.851-3.967-1.851-2.909 0-5.289 2.38-5.289 5.289 0 0.529 0 0.793 0.264 1.322-4.76-0.264-8.727-2.38-11.372-5.554-0.529 0.793-0.793 1.587-0.793 2.645 0 1.851 1.058 3.438 2.38 4.496-0.793 0-1.587-0.264-2.38-0.793 0 0 0 0 0 0 0 2.645 1.851 4.76 4.231 5.289-0.264 0.264-0.793 0.529-1.322 0.529-0.264 0-0.793 0-1.058 0 0.793 2.116 2.645 3.702 5.025 3.702-1.851 1.322-3.967 2.116-6.612 2.116-0.529 0-0.793 0-1.322 0 2.38 1.587 5.289 2.38 8.198 2.38 10.050 0 15.339-8.198 15.339-15.339 0-0.264 0-0.529 0-0.793 1.058-0.793 1.851-1.851 2.645-2.909-0.793 0.529-1.851 0.793-2.909 1.058z" />
          </symbol>
          <symbol id="editor-icon-facebook" viewBox="0 0 33 32">
            <title>facebook</title>
            <path d="M22.155 11.352h-3.983v-2.656c0-0.885 0.443-1.328 0.885-1.328h2.656v-4.426l-3.541-0.443c-4.426 0-5.311 3.541-5.311 5.754v3.098h-2.656v4.869h2.656v13.279h5.311v-13.279h3.541l0.443-4.869z" />
          </symbol>
          <symbol id="editor-icon-linkedin" viewBox="0 0 32 32">
            <title>linkedin</title>
            <path d="M12 9h5.535v2.837h0.079c0.77-1.381 2.655-2.837 5.464-2.837 5.842 0 6.922 3.637 6.922 8.367v9.633h-5.769v-8.54c0-2.037-0.042-4.657-3.001-4.657-3.005 0-3.463 2.218-3.463 4.509v8.688h-5.767v-18z" />
            <path d="M2 9h6v18h-6v-18z" />
            <path d="M8 4c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.657 1.343-3 3-3s3 1.343 3 3z" />
          </symbol>
          <symbol id="editor-icon-cog" viewBox="0 0 32 32">
            <title>cog</title>
            <path d="M29.181 19.070c-1.679-2.908-0.669-6.634 2.255-8.328l-3.145-5.447c-0.898 0.527-1.943 0.829-3.058 0.829-3.361 0-6.085-2.742-6.085-6.125h-6.289c0.008 1.044-0.252 2.103-0.811 3.070-1.679 2.908-5.411 3.897-8.339 2.211l-3.144 5.447c0.905 0.515 1.689 1.268 2.246 2.234 1.676 2.903 0.672 6.623-2.241 8.319l3.145 5.447c0.895-0.522 1.935-0.82 3.044-0.82 3.35 0 6.067 2.725 6.084 6.092h6.289c-0.003-1.034 0.259-2.080 0.811-3.038 1.676-2.903 5.399-3.894 8.325-2.219l3.145-5.447c-0.899-0.515-1.678-1.266-2.232-2.226zM16 22.479c-3.578 0-6.479-2.901-6.479-6.479s2.901-6.479 6.479-6.479c3.578 0 6.479 2.901 6.479 6.479s-2.901 6.479-6.479 6.479z" />
          </symbol>
          <symbol id="editor-icon-search" viewBox="0 0 32 32">
            <title>search</title>
            <path d="M30.171 26.667l-5.79-5.943c1.371-2.133 2.286-4.724 2.286-7.314 0-7.314-5.943-13.41-13.257-13.41s-13.41 5.943-13.41 13.41 5.943 13.41 13.257 13.41c2.743 0 5.181-0.762 7.314-2.286l5.79 5.79c0.457 0.457 1.371 0.457 1.829 0l1.829-1.829c0.61-0.457 0.61-1.371 0.152-1.829zM13.257 24.076c-5.79 0-10.667-4.876-10.667-10.667s4.724-10.667 10.667-10.667 10.667 4.876 10.667 10.667-4.724 10.667-10.667 10.667z" />
          </symbol>
          <symbol id="editor-icon-info2" viewBox="0 0 13 32">
            <title>info2</title>
            <path d="M10.536 10.806l-3.924 14.082c-0.231 0.693-0.231 1.385-0.231 1.616s0 0.231 0.231 0.462c0 0.231 0.231 0.231 0.462 0.231s0.462 0 0.693-0.231c0.693-0.462 1.385-1.385 2.078-2.77l0.693 0.462c-2.309 3.232-4.386 5.079-6.695 5.079-0.923 0-1.616-0.231-2.078-0.693s-0.693-1.154-0.693-1.847c0-0.462 0-1.154 0.231-1.847l2.77-9.465c0.462-1.154 0.462-1.847 0.462-2.309 0-0.231-0.231-0.462-0.462-0.693s-0.462-0.231-0.923-0.231c-0.231 0-0.462 0-0.693 0l0.231-0.693z" />
            <path d="M11.459 7.343c-0.462 0.462-1.154 0.923-2.078 0.923-0.693 0-1.385-0.231-2.078-0.923-0.462-0.693-0.693-1.385-0.693-2.078s0.231-1.385 0.923-2.078c0.462-0.462 1.154-0.923 2.078-0.923s1.616 0.231 2.078 0.923c0.462 0.462 0.693 1.154 0.693 2.078 0 0.693-0.231 1.385-0.923 2.078z" />
          </symbol>
          <symbol id="editor-icon-share" viewBox="0 0 32 32">
            <title>share</title>
            <path d="M17.254 18.877v6.491l10.622-10.622-10.622-10.622v6.491c-4.721 0.147-13.278 2.213-13.278 13.278v3.836l1.918-3.246c2.508-4.131 5.016-5.459 11.36-5.606z" />
          </symbol>
          <symbol id="editor-icon-logo" viewBox="0 0 194 32">
            <title>logo</title>
            <path d="M50.924 15.615c0.462-0.62 0.694-1.373 0.694-2.258 0-0.732-0.128-1.344-0.382-1.834-0.256-0.49-0.599-0.879-1.032-1.169s-0.936-0.513-1.511-0.637-1.183-0.203-1.823-0.203h-4.69v12.608h2.769v-5.122h1.192l2.632 5.122h3.326l-3.201-5.313c0.89-0.165 1.565-0.575 2.027-1.195v0zM48.514 14.136c-0.148 0.189-0.335 0.327-0.56 0.416-0.226 0.088-0.477 0.091-0.756 0.108s-0.542-0.024-0.791-0.024h-1.459v-2.758h1.637c0.249 0 0.504 0.022 0.764 0.057s0.492 0.106 0.694 0.206c0.201 0.101 0.367 0.246 0.498 0.435s0.195 0.443 0.195 0.762c0 0.343-0.074 0.609-0.222 0.798zM56.024 17.001h5.538v-2.758h-5.538v-1.97h5.538v-2.758h-8.307v12.608h8.703v-2.758h-5.934v-2.364zM70.407 15.482c-0.433-0.26-0.898-0.461-1.396-0.602s-0.964-0.283-1.396-0.425c-0.433-0.142-0.792-0.312-1.076-0.514s-0.427-0.49-0.427-0.868c0-0.236 0.059-0.437 0.178-0.602s0.273-0.298 0.462-0.398c0.19-0.1 0.391-0.174 0.605-0.221s0.421-0.071 0.623-0.071c0.344 0 0.708 0.068 1.093 0.203s0.691 0.346 0.916 0.629l1.903-2.072c-0.533-0.472-1.132-0.809-1.796-1.009s-1.352-0.301-2.063-0.301c-0.616 0-1.215 0.086-1.796 0.257s-1.093 0.428-1.538 0.77c-0.445 0.343-0.801 0.768-1.067 1.276s-0.4 1.098-0.4 1.771c0 0.697 0.145 1.258 0.436 1.683s0.655 0.768 1.094 1.028c0.438 0.26 0.913 0.466 1.423 0.62s0.984 0.307 1.422 0.461 0.803 0.34 1.094 0.558c0.29 0.219 0.436 0.517 0.436 0.894 0 0.225-0.057 0.42-0.169 0.585s-0.261 0.301-0.445 0.407-0.392 0.186-0.623 0.239c-0.231 0.053-0.46 0.080-0.685 0.080-0.462 0-0.91-0.103-1.343-0.31s-0.792-0.498-1.076-0.876l-1.974 2.161c0.604 0.555 1.256 0.957 1.956 1.205s1.458 0.372 2.276 0.372c0.651 0 1.272-0.083 1.858-0.248s1.102-0.419 1.547-0.761 0.797-0.773 1.058-1.294c0.261-0.52 0.391-1.128 0.391-1.824 0-0.732-0.142-1.317-0.427-1.754s-0.643-0.785-1.076-1.045zM84.483 11.009c-0.604-0.573-1.322-1.013-2.152-1.32s-1.737-0.461-2.721-0.461c-0.984 0-1.891 0.154-2.721 0.461s-1.547 0.747-2.152 1.32-1.076 1.266-1.414 2.082c-0.337 0.814-0.507 1.724-0.507 2.728s0.169 1.913 0.507 2.728c0.338 0.815 0.809 1.509 1.414 2.082s1.322 1.013 2.152 1.32c0.83 0.307 1.737 0.461 2.721 0.461s1.891-0.154 2.721-0.461c0.83-0.307 1.547-0.747 2.152-1.32s1.076-1.267 1.415-2.082c0.337-0.814 0.507-1.724 0.507-2.728s-0.169-1.913-0.507-2.728c-0.338-0.815-0.809-1.509-1.415-2.082zM83.247 17.44c-0.184 0.49-0.448 0.915-0.792 1.275s-0.756 0.641-1.236 0.842c-0.48 0.201-1.017 0.301-1.609 0.301s-1.129-0.1-1.61-0.301-0.892-0.481-1.236-0.842c-0.344-0.36-0.608-0.785-0.791-1.275s-0.276-1.030-0.276-1.621c0-0.578 0.092-1.116 0.276-1.612s0.447-0.924 0.791-1.284c0.344-0.36 0.756-0.64 1.236-0.842s1.017-0.301 1.61-0.301c0.593 0 1.129 0.1 1.609 0.301s0.892 0.481 1.236 0.842c0.344 0.361 0.608 0.788 0.792 1.284s0.276 1.033 0.276 1.612c0 0.591-0.092 1.131-0.276 1.621zM95.581 17.147c0 0.39-0.027 0.75-0.151 1.081s-0.282 0.617-0.507 0.859c-0.225 0.242-0.483 0.431-0.792 0.567s-0.642 0.204-1.009 0.204c-0.367 0-0.707-0.068-1.021-0.204s-0.583-0.325-0.808-0.567c-0.225-0.242-0.472-0.528-0.596-0.859s-0.258-0.691-0.258-1.081v-7.633h-2.769v7.739c0 0.744 0.182 1.429 0.407 2.055s0.595 1.169 1.040 1.63 1.016 0.821 1.68 1.080c0.664 0.26 1.443 0.39 2.321 0.39 0.865 0 1.635-0.13 2.299-0.39s1.22-0.62 1.665-1.080c0.445-0.461 0.743-1.004 0.968-1.63s0.301-1.311 0.301-2.055v-7.739h-2.769v7.633zM109.435 15.615c0.462-0.62 0.693-1.373 0.693-2.258 0-0.732-0.128-1.344-0.382-1.834-0.256-0.49-0.599-0.879-1.032-1.169s-0.936-0.513-1.511-0.637-1.182-0.203-1.823-0.203h-5.051v12.608h2.769v-5.122h1.554l2.632 5.122h3.326l-3.201-5.313c0.89-0.165 1.565-0.575 2.028-1.195zM107.025 14.136c-0.148 0.189-0.335 0.327-0.56 0.416-0.226 0.088-0.477 0.091-0.756 0.108s-0.543-0.024-0.792-0.024h-1.82v-2.758h1.998c0.249 0 0.504 0.022 0.764 0.057s0.493 0.106 0.694 0.206c0.201 0.101 0.367 0.246 0.498 0.435s0.195 0.443 0.195 0.762c0 0.343-0.074 0.609-0.222 0.798zM118.825 19.503c-0.439 0.237-0.943 0.355-1.511 0.355-0.498 0-0.964-0.1-1.396-0.301s-0.809-0.481-1.129-0.842c-0.32-0.36-0.572-0.785-0.756-1.275s-0.276-1.030-0.276-1.621c0-0.578 0.092-1.116 0.276-1.612s0.438-0.924 0.765-1.284c0.326-0.36 0.711-0.64 1.156-0.842s0.928-0.301 1.449-0.301 0.981 0.088 1.379 0.265c0.397 0.178 0.732 0.431 1.005 0.762l2.134-1.736c-0.273-0.342-0.581-0.632-0.925-0.868s-0.702-0.426-1.076-0.567c-0.373-0.141-0.753-0.245-1.138-0.31s-0.756-0.097-1.112-0.097c-0.984 0-1.891 0.154-2.721 0.461s-1.547 0.747-2.152 1.32-1.076 1.266-1.414 2.082c-0.337 0.814-0.507 1.724-0.507 2.728s0.169 1.913 0.507 2.728c0.338 0.815 0.809 1.509 1.414 2.082s1.322 1.013 2.152 1.32c0.83 0.307 1.737 0.461 2.721 0.461 0.865 0 1.707-0.177 2.525-0.531s1.494-0.903 2.028-1.648l-2.312-1.718c-0.285 0.425-0.646 0.756-1.085 0.992zM126.040 17.001h5.538v-2.758h-5.538v-1.97h5.934v-2.758h-8.703v12.608h9.098v-2.758h-6.329v-2.364zM148.899 9.515l-3.13 11.032h-0.036l-3.184-11.032h-1.494l-3.183 11.032h-0.036l-3.13-11.032h-1.209l3.663 12.608h1.441l3.184-11.032h0.036l3.184 11.032h1.44l3.664-12.608h-1.21zM155.301 9.515l-5.496 12.608h1.227l1.422-3.546h6.669l1.369 3.546h1.316l-5.3-12.608h-1.209zM152.918 17.789l2.934-6.873 2.846 6.873h-5.78zM161.642 10.697h4.351v11.426h1.187v-11.426h4.351v-1.182h-9.889v1.182zM181.497 20.274c-0.296 0.242-0.608 0.443-0.934 0.602s-0.661 0.278-1.005 0.354c-0.344 0.077-0.676 0.115-0.996 0.115-0.818 0-1.556-0.141-2.214-0.425s-1.218-0.673-1.68-1.169c-0.462-0.496-0.818-1.080-1.068-1.754s-0.373-1.399-0.373-2.179 0.125-1.506 0.373-2.179c0.249-0.673 0.605-1.258 1.068-1.754s1.023-0.886 1.68-1.169c0.658-0.283 1.396-0.425 2.214-0.425 0.64 0 1.265 0.136 1.877 0.407 0.61 0.272 1.111 0.703 1.502 1.293l0.96-0.797c-0.557-0.708-1.207-1.213-1.947-1.515s-1.538-0.451-2.392-0.451c-0.96 0-1.841 0.165-2.641 0.496s-1.485 0.788-2.054 1.373c-0.569 0.585-1.013 1.279-1.334 2.082s-0.48 1.683-0.48 2.639c0 0.956 0.16 1.84 0.48 2.648s0.765 1.506 1.334 2.091c0.569 0.584 1.254 1.039 2.054 1.364s1.681 0.487 2.641 0.487c0.925 0 1.784-0.177 2.579-0.531s1.494-0.939 2.098-1.754l-0.96-0.726c-0.225 0.343-0.487 0.635-0.783 0.877zM193.288 9.515v5.516h-7.12v-5.516h-1.187v12.608h1.187v-5.91h7.12v5.91h1.187v-12.608h-1.187z" />
            <path d="M10.296 5.764l-10.296 10.256 7.268 7.24 10.297-10.256-7.269-7.24z" />
            <path d="M19.051 11.387l4.161-4.144-7.131-7.104-4.161 4.144 7.131 7.104z" />
            <path d="M21.697 26.384l10.297-10.256-7.268-7.24-10.297 10.256 7.268 7.24z" />
            <path d="M12.943 20.76l-4.16 4.144 7.132 7.104 4.16-4.144-7.132-7.104z" />
          </symbol>
          <symbol id="editor-icon-hash" viewBox="0 0 28 32">
            <title>hash</title>
            <path d="M26.25 12.5v-3.5h-4.378l0.875-7h-3.5l-0.875 7h-6.998l0.875-7h-3.5l-0.875 7h-6.123v3.5h5.686l-0.873 7h-4.813v3.5h4.375l-0.875 7h3.5l0.875-7h6.998l-0.875 7h3.502l0.875-7h6.125v-3.5h-5.688l0.872-7h4.816zM17.061 19.5h-6.998l0.873-7h6.998l-0.873 7z" />
          </symbol>
          <symbol id="editor-icon-type" viewBox="0 0 32 32">
            <title>type</title>
            <path d="M26.5 2h-21c-0.483 0-0.875 0.392-0.875 0.875v5.25c0 0.483 0.392 0.875 0.875 0.875h0.875c0.483 0 0.875-0.392 0.875-0.875l1.75-2.625h5.25v21l-4.375 1.75c-0.483 0-0.875 0.391-0.875 0.875s0.392 0.875 0.875 0.875h12.25c0.484 0 0.875-0.391 0.875-0.875s-0.391-0.875-0.875-0.875l-4.375-1.75v-21h5.25l1.75 2.625c0 0.483 0.391 0.875 0.875 0.875h0.875c0.484 0 0.875-0.392 0.875-0.875v-5.25c0-0.483-0.391-0.875-0.875-0.875z" />
          </symbol>
          <symbol id="editor-icon-minus" viewBox="0 0 32 32">
            <title>minus</title>
            <path d="M5.5 17.909h20.894v-3.818h-20.894z" />
          </symbol>
          <symbol id="editor-icon-plus" viewBox="0 0 32 32">
            <title>plus</title>
            <path d="M13.282 2v11.2h-11.282v5.6h11.282v11.2h5.435v-11.2h11.282v-5.6h-11.282v-11.2z" />
          </symbol>
          <symbol id="editor-icon-filter" viewBox="0 0 32 32">
            <title>filter</title>
            <path d="M16 2c-7.732 0-14 1.959-14 4.375v2.625l10.5 10.5v8.75c0 0.966 1.567 1.75 3.5 1.75s3.5-0.784 3.5-1.75v-8.75l10.5-10.5v-2.625c0-2.416-6.268-4.375-14-4.375zM4.581 5.796c0.655-0.373 1.575-0.728 2.66-1.025 2.405-0.658 5.515-1.021 8.759-1.021s6.355 0.363 8.759 1.021c1.085 0.297 2.005 0.652 2.66 1.025 0.432 0.246 0.665 0.455 0.774 0.579-0.109 0.124-0.342 0.333-0.774 0.579-0.655 0.373-1.575 0.728-2.66 1.025-2.405 0.658-5.515 1.021-8.759 1.021s-6.354-0.363-8.759-1.021c-1.085-0.297-2.005-0.652-2.66-1.025-0.432-0.246-0.665-0.455-0.774-0.579 0.109-0.124 0.342-0.333 0.774-0.579z" />
          </symbol>
          <symbol id="editor-icon-star-empty" viewBox="0 0 32 32">
            <title>star-empty</title>
            <path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798zM16 23.547l-6.983 3.671 1.334-7.776-5.65-5.507 7.808-1.134 3.492-7.075 3.492 7.075 7.807 1.134-5.65 5.507 1.334 7.776-6.983-3.671z" />
          </symbol>
          <symbol id="editor-icon-star-full" viewBox="0 0 32 32">
            <title>star-full</title>
            <path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798z" />
          </symbol>
          <symbol id="editor-icon-play3" viewBox="0 0 32 32">
            <title>play3</title>
            <path d="M6 4l20 12-20 12z" />
          </symbol>
          <symbol id="editor-icon-pause2" viewBox="0 0 32 32">
            <title>pause2</title>
            <path d="M4 4h10v24h-10zM18 4h10v24h-10z" />
          </symbol>
          <symbol id="editor-icon-stop2" viewBox="0 0 32 32">
            <title>stop2</title>
            <path d="M4 4h24v24h-24z" />
          </symbol>
          <symbol id="editor-icon-column-arrow" viewBox="0 0 39 21">
            <title>Arrow</title>
            <path d="M17 13v8l22-10.5L17 0v8H0v5h17z" fill="#D2D3D6" fillRule="evenodd" />
          </symbol>
          <symbol id="editor-widget-saved" viewBox="0 0 163 117">
            <title>widget-saved</title>
            <path d="M140.058 16l-2 2H5a3 3 0 0 0-3 3v91a3 3 0 0 0 3 3h139a3 3 0 0 0 3-3V23.2l2-2V112a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V21a5 5 0 0 1 5-5h135.058zM34.793 49.707l1.414-1.414 36.486 36.486a3 3 0 0 0 4.243 0L161.5 0l1.5 1.5-84.65 84.693a5 5 0 0 1-7.071 0L34.793 49.707z" fillRule="nonzero" fill="#65B60D" />
          </symbol>
        </defs>
      </svg>
    );
  }
}
