import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ReduxThunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import WidgetEditor, { reducers, setConfig, getConfig, Tooltip, Modal, Icons, SaveWidgetModal, modalActions } from 'dist/bundle';
import 'leaflet/dist/leaflet.css';
import 'dist/styles.css';

const root = document.createElement('div');
document.body.appendChild(root);

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(applyMiddleware(ReduxThunk));
const store = createStore(combineReducers(reducers), enhancer);

// We set the config of the library
setConfig({
  url: 'https://api.resourcewatch.org/v1',
  env: 'production,preproduction',
  applications: 'prep',
  authUrl: 'https://api.resourcewatch.org/auth',
  assetsPath: '/images/',
  userToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4NzhjMTNiNWIyZWE3N2MxMWUxYmMxZCIsInJvbGUiOiJBRE1JTiIsInByb3ZpZGVyIjoibG9jYWwiLCJlbWFpbCI6ImNsZW1lbnQucHJvZGhvbW1lQHZpenp1YWxpdHkuY29tIiwiZXh0cmFVc2VyRGF0YSI6eyJhcHBzIjpbInJ3IiwiZ2Z3IiwiZ2Z3LWNsaW1hdGUiLCJwcmVwIiwiYXF1ZWR1Y3QiLCJmb3Jlc3QtYXRsYXMiLCJkYXRhNHNkZ3MiXX0sImNyZWF0ZWRBdCI6MTUxNzkzODc4MzQ0MCwiaWF0IjoxNTE3OTM4NzgzfQ._lU1C1dwTv6qFFZsuW6C8t-yc9fvdK7uQOt4V88k2HM'
});

/* eslint-disable */
const chartSpec = {
  "data": [
    {
      "name": "table",
      "format": {"parse": {"x": "date"}},
      "values": [],
      "transform": [
        {
          "type": "formula",
          "as": "q25",
          "expr": "units.type =='factor' ? round(units.value*datum.q25,2) : ( datum.q25-units.value)"
        },
        {
          "type": "formula",
          "as": "q50",
          "expr": "units.type =='factor' ? round(units.value*datum.q50,2) : (datum.q50-units.value)"
        },
        {
          "type": "formula",
          "as": "q75",
          "expr": "units.type =='factor' ? round(units.value*datum.q75,2) : (datum.q75-units.value)"
        }
      ]
    },
    {
      "name": "range1Data",
      "source": "table",
      "transform": [
        {
          "type": "filter",
          "expr": "year(datum.x) >= utcyear(range1.start) && year(datum.x) <= utcyear(range1.end)"
        },
        {
          "type": "formula",
          "as": "date_end",
          "expr": "range1.end"
        },
        {
          "type": "formula",
          "as": "date_start",
          "expr": "range1.start"
        },
        {
          "type": "aggregate",
          "fields": [
            "q25",
            "q75",
            "x",
            "date_end",
            "date_start"
          ],
          "ops": [
            "min",
            "max",
            "min",
            "min",
            "min"
          ],
          "as": [
            "q25",
            "q75",
            "x",
            "date_end",
            "date_start"
          ]
        }
      ]
    },
    {
      "name": "range2Data",
      "source": "table",
      "transform": [
        {
          "type": "filter",
          "expr": "year(datum.x) >= utcyear(range2.start) && year(datum.x) <= utcyear(range2.end)"
        },
        {
          "type": "formula",
          "as": "date_end",
          "expr": "range2.end"
        },
        {
          "type": "formula",
          "as": "date_start",
          "expr": "range2.start"
        },
        {
          "type": "aggregate",
          "fields": [
            "q25",
            "q75",
            "x",
            "date_end",
            "date_start"
          ],
          "ops": [
            "min",
            "max",
            "min",
            "min",
            "min"
          ],
          "as": [
            "q25",
            "q75",
            "x",
            "date_end",
            "date_start"
          ]
        }
      ]
    },
    {
      "name": "legend",
      "values": [
        {"cat": "Models average"},
        {"cat": "Models amplitude between 25th and 75th percentile"},
        {"cat": "Selected period(s)"}
      ]
    },
    {
      "name": "dots",
      "source": "table",
      "transform": [
        {
          "type": "filter",
          "expr": "hover && hover.datum.x === datum.x"
        }
      ]
    }
  ],
  "signals": [
    {
      "name": "range1Middle",
      "update": "(+range1.start + +range1.end) / 2"
    },
    {
      "name": "range1Label",
      "update": "utcyear(range1.start) + '-' + utcyear(range1.end)"
    },
    {
      "name": "range2Middle",
      "update": "range2 ? (+range2.start + +range2.end) / 2 : 0"
    },
    {
      "name": "range2Label",
      "update": "range2 ? utcyear(range2.start) + '-' + utcyear(range2.end) : ''"
    },
    {
      "name": "hover",
      "value": null,
      "on": [
        {
          "events": "@cell:mouseover",
          "update": "datum"
        },
        {
          "events": "@cell:mouseout",
          "update": "null"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "utc",
      "range": "width",
      "zero": false,
      "domain": {
        "data": "table",
        "field": "x"
      }
    },
    {
      "name": "y",
      "type": "linear",
      "range": "height",
      "zero": false,
      "nice": true,
      "domain": {
        "fields": [
          {
            "data": "table",
            "field": "q75"
          },
          {
            "data": "table",
            "field": "q25"
          }
        ]
      }
    },
    {
      "name": "color",
      "type": "ordinal",
      "zero": false,
      "points": true,
      "range": [
        "#E9ECEE",
        "#263e57",
        "#efa600"
      ],
      "domain": {
        "fields": [
          {
            "data": "legend",
            "field": "cat"
          }
        ],
        "sort": true
      }
    }
  ],
  "axes": [
    {
      "scale": "x",
      "labelOverlap": "parity",
      "orient": "bottom",
      "encode": {
        "labels": {
          "update": {
            "font": {
              "value": "Open Sans"
            },
            "fontSize": {
              "value": 10
            },
            "fill": {
              "value": "#3B4F63"
            },
            "opacity": {
              "value": 0.7
            }
          }
        },
        "axis": {
          "update": {
            "stroke": {
              "value": "#393F44"
            },
            "opacity": {
              "value": 0.3
            }
          }
        },
        "ticks": {
          "update": {
            "stroke": {
              "value": "#393F44"
            },
            "opacity": {
              "value": 0.3
            }
          }
        }
      }
    },
    {
      "scale": "y",
      "zindex": 1,
      "labelOverlap": "parity",
      "orient": "left",
      "encode": {
        "labels": {
          "update": {
            "font": {
              "value": "Open Sans"
            },
            "fontSize": {
              "value": 10
            },
            "fill": {
              "value": "#3B4F63"
            },
            "opacity": {
              "value": 0.7
            }
          }
        },
        "axis": {
          "update": {
            "stroke": {
              "value": "#393F44"
            },
            "opacity": {
              "value": 0.3
            }
          }
        },
        "ticks": {
          "update": {
            "stroke": {
              "value": "#393F44"
            },
            "opacity": {
              "value": 0.3
            }
          }
        },
        "title": {
          "update": {
            "font": {
              "value": "Open Sans"
            },
            "fontSize": {
              "value": 10
            },
            "fill": {
              "value": "#3B4F63"
            },
            "opacity": {
              "value": 0.7
            }
          }
        }
      }
    }
  ],
  "marks": [
    {
      "type": "area",
      "interactive": false,
      "from": {
        "data": "table"
      },
      "encode": {
        "enter": {
          "interpolate": {
            "value": "monotone"
          },
          "x": {
            "scale": "x",
            "field": "x"
          },
          "y": {
            "scale": "y",
            "field": "q75"
          },
          "y2": {
            "scale": "y",
            "field": "q25"
          },
          "fill": {
            "value": "#E9ECEE"
          }
        }
      }
    },
    {
      "name": "lines",
      "interactive": false,
      "type": "line",
      "from": {
        "data": "table"
      },
      "encode": {
        "enter": {
          "interpolate": {
            "value": "monotone"
          },
          "x": {
            "scale": "x",
            "field": "x"
          },
          "y": {
            "scale": "y",
            "field": "q50"
          },
          "stroke": {
            "value": "#263e57"
          },
          "strokeWidth": {
            "value": 2
          },
          "strokeDash": {
            "value": [
              8,
              8
            ]
          }
        }
      }
    },
    {
      "type": "rect",
      "interactive": false,
      "from": {
        "data": "range1Data"
      },
      "encode": {
        "enter": {
          "interpolate": {
            "value": "monotone"
          },
          "x": {
            "scale": "x",
            "field": "x"
          },
          "y": {
            "scale": "y",
            "field": "q75"
          },
          "y2": {
            "scale": "y",
            "field": "q25"
          },
          "fillOpacity": {
            "value": 0
          },
          "strokeOpacity": {
            "value": 1
          },
          "stroke": {
            "value": "#EFA600"
          },
          "strokeWidth": {
            "value": 2
          }
        }
      }
    },
    {
      "type": "text",
      "interactive": false,
      "from": {
        "data": "range1Data"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "x",
            "signal": "range1Middle"
          },
          "y": {
            "scale": "y",
            "field": "q75"
          },
          "dy": {
            "value": -10
          },
          "align": {
            "value": "center"
          },
          "text": {
            "signal": "range1Label"
          },
          "font": {
            "value": "Open Sans"
          },
          "fontSize": {
            "value": 13
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#EFA600"
          }
        }
      }
    },
    {
      "type": "rect",
      "interactive": false,
      "from": {
        "data": "range2Data"
      },
      "encode": {
        "enter": {
          "interpolate": {
            "value": "monotone"
          },
          "x": {
            "scale": "x",
            "field": "x"
          },
          "y": {
            "scale": "y",
            "field": "q75"
          },
          "y2": {
            "scale": "y",
            "field": "q25"
          },
          "fillOpacity": {
            "value": 0
          },
          "strokeOpacity": {
            "value": 1
          },
          "stroke": {
            "value": "#EFA600"
          },
          "strokeWidth": {
            "value": 2
          }
        }
      }
    },
    {
      "type": "text",
      "interactive": false,
      "from": {
        "data": "range2Data"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "x",
            "signal": "range2Middle"
          },
          "y": {
            "scale": "y",
            "field": "q75"
          },
          "dy": {
            "value": -10
          },
          "align": {
            "value": "center"
          },
          "text": {
            "signal": "range2Label"
          },
          "font": {
            "value": "Open Sans"
          },
          "fontSize": {
            "value": 13
          },
          "fontWeight": {
            "value": "bold"
          },
          "fill": {
            "value": "#EFA600"
          }
        }
      }
    },
    {
      "name": "points",
      "interactive": false,
      "type": "symbol",
      "from": {
        "data": "dots"
      },
      "encode": {
        "enter": {
          "fill": {
            "value": "#263e57"
          },
          "stroke": {
            "value": "#fff"
          },
          "x": {
            "scale": "x",
            "field": "x"
          },
          "y": {
            "scale": "y",
            "field": "q50"
          }
        },
        "update": {
          "zindex": {
            "value": 10
          },
          "opacity": {
            "value": 1
          }
        }
      }
    },
    {
      "name": "cell",
      "type": "path",
      "from": {
        "data": "lines"
      },
      "transform": [
        {
          "type": "voronoi",
          "x": "datum.x",
          "y": "datum.y",
          "size": [
            {
              "signal": "width"
            },
            {
              "signal": "height"
            }
          ]
        }
      ],
      "encode": {
        "update": {
          "fill": {
            "value": "red"
          },
          "path": {
            "field": "path"
          },
          "opacity": {
            "value": 0
          }
        }
      }
    }
  ],
  "legends": [
    {
      "fill": "color",
      "orient": "bottom",
      "encode": {
        "title": {
          "enter": {
            "fontSize": {
              "value": 12
            }
          }
        },
        "labels": {
          "enter": {
            "limit": {
              "signal": "(width*0.9)"
            },
            "fontSize": {
              "value": 12
            },
            "fill": {
              "value": "#3B4F63"
            },
            "opacity": {
              "value": 0.7
            }
          }
        },
        "symbols": {
          "enter": {
            "shape": {
              "value": "square"
            },
            "size": {
              "value": 50
            }
          }
        }
      }
    }
  ],
  "interaction_config": [
    {
      "name": "tooltip",
      "config": {
        "fields": [
          {
            "column": "datum.q50",
            "property": "Average",
            "type": "number",
            "format": ".2f"
          },
          {
            "column": "datum.q25",
            "property": "25th percentile",
            "type": "number",
            "format": ".2f"
          },
          {
            "column": "datum.q75",
            "property": "75th percentile",
            "type": "number",
            "format": ".2f"
          },
          {
            "column": "datum.range",
            "property": "Date range",
            "type": "string",
            "format": null
          }
        ]
      }
    }
  ]
};
/* eslint-enable */

class App extends React.Component {
  static injectStyles() {
    const styles = `
      *,
      *:before,
      *:after {
        box-sizing: border-box;
      }

      body {
        font-family: sans-serif;
      }
    `;

    const node = document.createElement('style');
    node.innerHTML = styles;
    document.body.appendChild(node);
  }

  constructor(props) {
    super(props);
    this.state = {
      currentWidget: undefined,

      app: getConfig().applications,
      unmigratedWidgets: [],
      manualWidgets: [],
      erroredWidgets: [],
      errors: [],
      migrated: 0,
      started: false,
      finished: false
    };
  }

  componentWillMount() {
    // We inject basic styles so the test page
    // renders correctly
    App.injectStyles();
  }

  componentDidMount() {
    this.getWidgetsList(this.state.app)
      .then(widgets => this.getUnmigratedWidgets(widgets))
      .then(([unmigratedWidgets, manualWidgets]) => new Promise(resolve => this.setState({ unmigratedWidgets, manualWidgets }, resolve)));
  }

  async onSave() {
    if (this.getWidgetConfig) {
      this.props.toggleModal(true, {
        children: SaveWidgetModal,
        childrenProps: {
          datasetId: this.state.datasetId,
          getWidgetConfig: this.getWidgetConfig,
          onClickCheckWidgets: () => alert('Check my widgets'),
          onChangeWidgetTitle: title => this.setState({ widgetTitle: title })
        }
      });
    }
  }

  getWidgetsList(app) { // eslint-disable-line class-methods-use-this
    return fetch(`https://api.resourcewatch.org/v1/widget/?page[size]=9999999&app=${app}&env=preproduction,production&includes=user`)
      .then(res => res.json())
      .then(({ data: widgets }) => widgets)
      .catch(() => {
        this.setState({ errors: [...this.state.errors, `Unable to get the list of widgets for ${app}`] });
        throw new Error();
      });
  }

  getUnmigratedWidgets(widgetsList) { // eslint-disable-line class-methods-use-this
    const unmigrated = [];
    const manual = [];
    widgetsList.forEach((widget) => {
      const widgetConfig = widget.attributes.widgetConfig;
      if (!widgetConfig) return false;

      const type = widgetConfig.type;
      if (type === 'map' || type === 'embed') {
        return false;
      }

      const name = widget.attributes.name;
      if (name.indexOf('[Vega 3]') !== -1) return false;

      const paramsConfig = widgetConfig.paramsConfig;
      const nexgddp = widgetConfig.signals && widgetConfig.signals.length && widgetConfig.signals.find(s => s.name === 'range1Middle');
      if (!paramsConfig && !nexgddp) {
        manual.push(widget);
        return false;
      }

      if (nexgddp) {
        widget.nexgddp = true;
      }

      unmigrated.push(widget);
    });

    return [unmigrated, manual];
  }

  generateNexGDDP(data, range1, range2, units) { // eslint-disable-line class-methods-use-this
    const range1Signal = {
      name: 'range1',
      update: `{ start: utc(${range1[0]}, 0, 1), end: utc(${range1[1]}, 0, 1) }`
    };

    const range2Signal = { name: 'range2', update: 'false' };
    if (range2) {
      range2Signal.update = `{ start: utc(${range2[0]}, 0, 1), end: utc(${range2[1]}, 0, 1) }`;
    }

    const unitsSignal = units
      ? { name: 'units', update: JSON.stringify(units) }
      : null;

    const signals = [range1Signal, range2Signal, unitsSignal, ...chartSpec.signals]
      .filter(signal => signal !== null);

    // We create a new spec each time so the Vega component renders again
    // WARNING: it needs immutable data to detect the changes
    const spec = Object.assign({}, chartSpec, { signals });
    spec.data = [...spec.data];

    // We add a new column to the data "range" so we can display the
    // date range in the tooltip
    const resolution = data.length >= 2
      ? new Date(data[1].x).getUTCFullYear() - new Date(data[0].x).getUTCFullYear()
      : null;
    spec.data[0] = Object.assign({}, spec.data[0]);
    spec.data[0].values = data.map((d) => {
      if (!resolution) return d;
      const start = new Date(d.x).getUTCFullYear();
      const end = (start + resolution) - 1;
      return Object.assign({}, d, { range: `${start}-${end}` });
    });

    // We add the unit to the y axis
    if (units) {
      const yAxis = Object.assign({}, spec.axes.find(axis => axis.scale === 'y'), { title: units.to });
      spec.axes = [...spec.axes];
      for (let i = 0, j = spec.axes.length; i < j; i++) {
        if (spec.axes[i].scale === 'y') {
          spec.axes[i] = yAxis;
          break;
        }
      }
    }

    return spec;
  }

  migrateNexGDDP(widget) {
    const widgetConfig = widget.attributes.widgetConfig;
    if (!widgetConfig) {
      this.promise.reject({ error: 'NexGDDP chart without widgetConfig' });
      return;
    }

    const signals = widgetConfig.signals;
    const range1Signal = signals.find(s => s.name === 'range1');
    const range2Signal = signals.find(s => s.name === 'range2');
    const unitsSignal = signals.find(s => s.name === 'units');

    if (!range1Signal) {
      this.promise.reject({
        error: 'NexGDDP chart without range1 signal'
      });
      return;
    }

    const range1 = range1Signal.init.expr.match(/utc\(((\d+)), \d, \d\)/g)
      .map(m => +m.match(/utc\((\d+), \d, \d\)/)[1]);
    let range2 = [];
    if (range2Signal && range2Signal.init.expr) {
      range2 = range2Signal.init.expr.match(/utc\(((\d+)), \d, \d\)/g)
        .map(m => +m.match(/utc\((\d+), \d, \d\)/)[1]);
    }

    let units = null;
    if (unitsSignal) {
      units = JSON.parse(unitsSignal.init.expr);
    }

    const data = widgetConfig.data[0].values;

    const spec = this.generateNexGDDP(data, range1, range2, units);

    this.promise.resolve(spec);
  }

  migrateWidgets(i = 0) { // eslint-disable-line class-methods-use-this
    const widget = this.state.unmigratedWidgets[i];

    return new Promise((resolve) => {
      if (i === 0) {
        this.setState({ started: true }, resolve);
      } else {
        resolve();
      }
    })
      .then(() => new Promise((resolve, reject) => {
        this.promise = {
          reject,
          resolve
        };
        if (widget.nexgddp) {
          this.migrateNexGDDP(widget);
        } else {
          this.setState({ currentWidget: widget });
        }
      }))
      .then(() => new Promise((resolve) => {
        widget.migrated = true;
        this.setState({ migrated: this.state.migrated + 1 }, resolve);
      }))
      .catch(err => new Promise((resolve) => {
        widget.error = err;
        this.setState({
          errors: [...this.state.errors, `Unable to migrate ${widget.id} – ${err}`],
          erroredWidgets: [...this.state.erroredWidgets, widget]
        }, resolve);
      }))
      .then(() => (this.state.unmigratedWidgets.length - 1 >= i + 1) && this.migrateWidgets(i + 1))
      .then(() => new Promise((resolve) => {
        if (i === 0) {
          this.setState({ finished: true }, resolve);
        } else {
          resolve();
        }
      }))
      .catch(() => new Promise((_, reject) => {
        if (i === 0) {
          this.setState({ errors: [...this.state.errors, 'Migration aborted'] }, reject);
        } else {
          reject();
        }
      }));
  }

  render() {
    return (
      <div>
        <h1>Migration</h1>
        <Icons />
        <Tooltip />
        <Modal />
        <div style={{ border: '1px solid black', margin: '40px 0', padding: '0 10px' }}>
          <ul>
            <li>Retrieving the list of widgets for {this.state.app}...</li>
            { !!this.state.manualWidgets.length && <li>Widgets to manually migrate: <strong>{this.state.manualWidgets.length}</strong></li> }
            { !!this.state.unmigratedWidgets.length && <li>Widgets to migrate: <strong>{this.state.unmigratedWidgets.length}</strong></li> }
            { !!this.state.manualWidgets.length && !!this.state.unmigratedWidgets.length && this.state.started && <li>Migrating: <strong>{this.state.migrated} / {this.state.unmigratedWidgets.length}</strong></li> }
            { !!this.state.manualWidgets.length && !!this.state.unmigratedWidgets.length && !this.state.started && <li><button type="button" onClick={() => this.migrateWidgets()}>Start migration</button></li>}
            { !!this.state.errors.length && this.state.errors.map(e => <li key={e} style={{ color: 'red' }}>{e}</li>)}
            { this.state.finished && <li>Migration done</li> }
            { this.state.finished && <img src="https://media.giphy.com/media/l3q2Z6S6n38zjPswo/giphy.gif" />}
          </ul>
        </div>
        <div style={{ border: '1px solid black', margin: '40px 0', padding: '20px 10px' }}>
          { !!this.state.manualWidgets.length && (
            <div>
              <label htmlFor="manual">Widgets to manually migrate</label>
              <textarea id="manual" style={{ display: 'block', margin: '5px 0 20px', width: '100%', height: '250px' }} value={this.state.manualWidgets.map(w => `${w.id} (${w.attributes.user ? w.attributes.user.name || w.attributes.user.email : 'Unknown'})`).join('\n')} readOnly />
            </div>
          )}
          { !!this.state.unmigratedWidgets.length && (
            <div>
              <label htmlFor="unmigrated">Widgets to migrate</label>
              <textarea id="unmigrated" style={{ display: 'block', margin: '5px 0 20px', width: '100%', height: '250px' }} value={this.state.unmigratedWidgets.map(w => `${w.id}${w.migrated ? `${w.nexgddp ? ' - NEXGDDP' : ' -        '} (${w.attributes.user ? w.attributes.user.name || w.attributes.user.email : 'Unknown'}) - MIGRATED` : `${w.nexgddp ? ' - NEXGDDP' : ' -        '} (${w.attributes.user ? w.attributes.user.name || w.attributes.user.email : 'Unknown'})`}`).join('\n')} readOnly />
            </div>
          )}
          { !!this.state.erroredWidgets.length && (
            <div>
              <label htmlFor="unmigrated" style={{ color: 'red' }}>Widgets with error</label>
              <textarea id="unmigrated" style={{ display: 'block', margin: '5px 0 20px', width: '100%', height: '250px' }} value={this.state.erroredWidgets.map(w => `${w.id} (${w.attributes.user ? w.attributes.user.name || w.attributes.user.email : 'Unknown'})${w.nexgddp ? ' - NEXGDDP' : ''}${w.error ? ` - ${w.error}` : ''}`).join('\n')} readOnly />
            </div>
          )}
        </div>
        { this.state.currentWidget && (
          <WidgetEditor
            datasetId={this.state.currentWidget.attributes.dataset}
            widgetId={this.state.currentWidget.id}
            saveButtonMode="always"
            embedButtonMode="never"
            titleMode="always"
            onSave={() => this.onSave()}
            provideWidgetConfig={(func) => { this.getWidgetConfig = func; }}
            onMigrate={widgetConfig => (widgetConfig.error ? this.promise.reject(widgetConfig.error) : this.promise.resolve(widgetConfig))}
          />
        )}
      </div>
    );
  }
}

App.propTypes = {
  toggleModal: PropTypes.func
};

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch => ({
  toggleModal: (...params) => dispatch(modalActions.toggleModal(...params))
});

const Container = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(
  <Provider store={store}>
    <Container />
  </Provider>,
  root
);
