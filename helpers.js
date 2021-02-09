exports.menu = [
  { title: "Liikmed", slug: "/members" },
  { title: "Lisa liige", slug: "/add-member" },
  {title: "Arved", slug: "/bills"},
  { title: "Lisa arve", slug: "/add-bill" },
];

exports.defaultDate = () => {
  return new Date().toJSON().slice(0, 10);
};

exports.ADD = 'ADD'
exports.SUBTRACT = 'SUBTRACT'
