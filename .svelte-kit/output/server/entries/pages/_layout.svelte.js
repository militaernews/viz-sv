import "clsx";
function _layout($$payload, $$props) {
  let { children } = $$props;
  $$payload.out.push(`<div class="container mx-auto h-screen max-w-3xl">`);
  children($$payload);
  $$payload.out.push(`<!----></div>`);
}
export {
  _layout as default
};
