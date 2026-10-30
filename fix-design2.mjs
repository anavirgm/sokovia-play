import { readFileSync, writeFileSync } from "fs";
const p = "features/catalog/data/design-preview.ts";
let s = readFileSync(p, "utf8");
s = s.replace(
  /rating: (8\.5|7\.7|7\.4|8|7\.8|7\.3|7\.1|8\.3|6\.7|6\.8|5\.9|7\.2),\r?\n  }/g,
  'rating: $1,\n    mediaType: "movie",\n  }',
);
s = s.replace(/rating: null,\r?\n  }/g, 'rating: null,\n    mediaType: "movie",\n  }');
s = s.replace(
  /overview: null,\r?\n    rating: 6\.8,\r?\n  }/g,
  'overview: null,\n    rating: 6.8,\n    mediaType: "movie",\n  }',
);
s = s.replace(
  /overview: null,\r?\n    rating: 6\.8,\n    mediaType: "movie",\r?\n  }/g,
  'overview: null,\n    rating: 6.8,\n    mediaType: "movie",\n  }',
);
writeFileSync(p, s);
console.log("done");
