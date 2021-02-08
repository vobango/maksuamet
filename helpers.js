exports.menu = [
  { title: "Liikmed", slug: "/members" },
  { title: "Lisa liige", slug: "/add-member" },
  { title: "Lisa arve", slug: "/add-bill" }
];

exports.defaultDate = () => {
  return new Date().toJSON().slice(0, 10);
};
