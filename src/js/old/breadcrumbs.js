import { state } from "../state.js"

export default {
  view: function() {
    return state.breadcrumbs.map(function(crumb) {
      return m(m.route.Link, { class: "item-breadcrumbs", href: crumb.url }, crumb.text);
    });
  }
}
