# Changelog

## v1.3.6 - 14/08/2018
- Fix an issue where the numerical filters wouldn't work with "featureservice" datasets (workaround of an API bug)
- Fix an issue where the legend of the map wouldn't work

## v1.3.5 - 27/07/2018
- Accept React 15 and 16 as peer dependency

## v1.3.4 - 24/07/2018
- Fix an issue where the `.buttons` class wouldn't be scoped (now it starts with `c-we-`)
- Add the prop `allowBoundsCopyPaste` to display the bounds of the map (previously, it was always available)
- Let the user copy and paste the bounds of the map (using the localStorage) if `allowBoundsCopyPaste` is present
- Update the dependency [wri-api-components](http://github.com/resource-watch/wri-api-components/) to fix an issue that prevented the editor from working with React 16
- In the README, add the version(s) for which each editor's prop is available

## v1.3.3 - 17/07/2018
- Fix an issue where the legend wouldn't respect the theme colors
- Fix an issue where `VegaChart` wouldn't re-render when the theme would be dynamically updated
- Add a button on the map to let the user see and modify its bounds

## v1.3.2 - 26/06/2018
- Don't filter out the columns of type "long" and "double" (internal types)

## v1.3.1 - 21/06/2018
- When the dataset doesn't have any field, display the error in the console
- For the bar chart, truncate the labels of the x axis to 12 characters when they are vertical
- For the bar chart, display the ticks vertically if the widget is small or if there are more than 10 bars
- Rename the visualization "Bar" by "Bar (vertical)" and add a new "Bar (horizontal)" one
- Update the URL of the basemaps, labels and boundaries layers
- Tell the user the values of the filters might take some time to load (message shown after 10s)

## v1.3.0 - 01/06/2018
- Fix a bug where changing the theme wouldn't re-render the visualization
- Fix a style issue where the content of the map editor wouldn't be centered
- Allow up to 500 results (the default limit stays at 50)
- Fix an issue where the limit filter may not be restored correctly
- Improve the performance by preventing useless re-renders
- Change how `VegaChart` chooses the theme: the `theme` props takes precedence over the widget's embedded theme (i.e. `config` object, if any), which also takes precedence over the default theme
- Store the theme of the widget in `widgetConfig` and restore it in the editor (the `theme` prop takes precedence over it)

## v1.2.2 - 30/05/2018
- Fix an issue that would prevent the creation of widgets through `SaveWidgetModal`

## v1.2.1 - 21/05/2018
- Fix a bug preventing the user from creating a layer

## v1.2.0 - 18/05/2018
- Fix a bug where the title and caption wouldn't be set at the mounting of the editor
- Sync the title of the widget with the name of the selected layer
- Add the `useLayerEditor` prop to let the user create a Carto or GEE layer
- Add the `provideLayer` prop to get the layer created by the user
- Change the signature of the `saveUserWidget` and `updateUserWidget` functions of [`WidgetService`](https://github.com/resource-watch/widget-editor/blob/develop/src/services/WidgetService.js)

## v1.1.0 - 23/04/2018
- Use the [wri-api-components](http://github.com/resource-watch/wri-api-components/)'s `Legend` component for the map
- Display the ticks of the Y axis of the bar, line and scatter charts with the SI unit
- Add the possibility to contract the left panel (prop `contracted`)
- Save and restore the basemap, labels and boundaries layers for the map widgets
- Change the color of the title and caption to white for the dark and satellite basemaps
- Fix a bug where the size of the left panel would vary
- Add a new prop, `theme`, to customize the visual appearance of the Vega visualizations
- Remove Leaflet from the peer dependencies (possibility to load it from a CDN)
- Fix a bug where the aggregation would often not be restored
- Change the signature of the `saveUserWidget` and `updateUserWidget` functions of [`WidgetService`](https://github.com/resource-watch/widget-editor/blob/develop/src/services/WidgetService.js)
- Save and restore the caption from the metadata of the widget instead of the `widgetConfig` object

## v1.0.6 - 10/04/2018
- Improve the styles of the columns, especially when overflowing
- Fix an issue where non-existing bounds could be passed to the map
- Don't limit the number of layers to 10

## v1.0.5 - 05/04/2018
- Fix a bug where the date filter wouldn't work (formatting issue in the query)

## v1.0.4 - 05/04/2018
- Fix bugs where the data URL would be miscomputed when using an aggregation and sorting at the same time
- Make the sorting descending by default
- By default, sort the pie and bar charts by the value column (descending)
- Don't use Jiminy to get chart recommendations anymore
- Disable the 1d_scatter and 1d_tick charts
- Rename the "Category", "Value", "Filter" and "Limit" column containers
- Replace the keyword "widget" by "visualization" across the project
- Vastly improve the date filter
- Move and rename the area intersection filter
- Don't minify the JS bundle in develoment mode
- Fix a bug where the tooltip of the filters could disappear right after opening
- Fix an issue where the area intersection filter wouldn't work

## v1.0.3 - 28/03/2018
- Disable zoom on scroll by default
- Category and value labels rename
- Show alias tooltip immediately on hover
- “Visualization type” dropdown changed to radio buttons/facets
- Change default limit to 50
- Prevent the bars from overlapping when they have same x values

## v1.0.2 - 06/03/2018
- Remove the timeline from the legend (map only)

## v1.0.1 - 27/01/2018
- Fix a bug where the date filters wouldn't work
- Fix an issue where the UserService would send a wrong "Authorization" header

## v1.0.0 - 21/02/2018
- Migrate from Vega 2 to Vega 3 (not backward compatible)
- Increase the timeout for the data fetching to 30s (due to Carto's latency in some cases)
- Prevent the title and caption from overlapping the legend, if any
- Fix a bug where the user's last interaction wouldn't be necessarily the one reflected by the visualization
- Fix a bug where the height of the chart would grow in the editor after a resize

## v0.1.3 - 12/02/2018
- Remove unused CSS rules that would interfere with the styles of RW or Prep
- Auto-pan to the bounding box of a layer, if provided
- Save and restore the bounding box of the widgets
- Support for WMS datasets

## v0.1.2 - 31/01/2018
- Fix a bug where the save button would appear with the table visualization and throw a controlled error when the user tries to get its config
- Remove React warning in the tooltip
- Fix a bug that would prevent the tooltip and the legend from displaying dates
- Remove the code that forced the tooltip to show the column "x" (only for the tooltips opened based on the horizontal position of the cursor)
- Fix a bug that would prevent `VegaChart` from re-rendering when the data's changed
- Fix a bug that would force the user to add an optional prop to `VegaChart`

## v0.1.1 - 26/01/2018
- Improve the resilience of the tooltip of the Vega charts and allow more than two values to be displayed at once
- Show 'save' not 'update' when viewing default widgets in explore
- Autoselect the default layer, if present, in the `MapEditor` component
- Let the title of the widget being controlled from the outside
- Fix a bug where the `locale` attribute of the config wouldn't default to `"en"`
- Fix a bug where the columns wouldn't get their alias and description
- Autoselect the first available chart type when the visualization is "Chart"
- Add a caption to the editor, controllable from the outside and linked to the `titleMode` prop
- By default, let the chart's legend opened (if any)

## v0.1.0 - 12/01/2018
- Fix a bug that prevented map widgets from being restored
- Add the missing Leaflet stylesheet to the testing file
- Add a watch mode for the JS files
- Remove external CSS for `rc-slider`
- Scope all of the CSS classes of the components (now they start with `c-we-` instead of just `c-`)

## v0.0.9 - 12/01/2018
- Add the missing type to some buttons
- Add `rc-slider/assets/index.css` as required dependency

## v0.0.8 - 15/12/2017
- Fix an issue that would prevent the update of the config
- Remove the `widgetConfig` prop of `SaveWidgetModal` and replace it by `getWidgetConfig`
- Fix the endpoint used in `removeUserWidget` from the `WidgetService`
- Fix issues with the auth token in `WidgetService`
- Build the library with [Rollup](https://rollupjs.org/) and make it SSR-ready
- Add a new attribute `assetsPath` to the configuration (mandatory)
- Scope the actions to avoid conflicts

## v0.0.7 - 08/12/2017
- Remove the `widgetEditorExplore` reducer and actions
- Reduce the size of the library by 1% (-9kB) minified

## v0.0.6 - 07/12/2017
- Add the `embedButtonMode` prop for the `WidgetEditor` component
- Add the `onEmbed` prop for the `WidgetEditor` component
- Possibility to use `EmbedTableModal` as an external component
- Fix a bug where the area intersection filter would display "Waiting for actions"
- Remove the need for `babel-polyfill`
- Reduce the size of the library by 53% (-997kB) minified

## v0.0.5 - 04/12/2017
- Add missing params to the queries (`application` and `env`)

## v0.0.4 - 04/12/2017
- Added an option to set the default state of the map

## v0.0.3 - 04/12/2017
- External images use absolute URLs and documentation about how to configure webpack to load them
- Fixed bug that prevented layers from other apps than RW to be displayed
- Made the `userEmail` property optional in the configuration
- Scope the styles of the modal
- Fixed bug that would prevent the editor from correctly restoring some widgets

## v0.0.2 - 30/11/2017

- Use react 15.x instead of react 16

## v0.0.1 - 29/11/2017

Initial version of the library
