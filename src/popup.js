function parseCIDR(cidr_str) {
  const [ip, range] = cidr_str.split("/");

  const upper_bits_num = parseInt(range, 10);

  const bitmask = "1".repeat(upper_bits_num) + "0".repeat(32-upper_bits_num);

  const c = parseInt(bitmask, 2);
  const netmask = [
    (c & 0xFF000000) >>> 24,
    (c & 0x00FF0000) >>> 16,
    (c & 0x0000FF00) >>> 8,
    (c & 0x000000FF) >>> 0,
  ];

  const wild = [
    255 - netmask[0],
    255 - netmask[1],
    255 - netmask[2],
    255 - netmask[3],
  ];

  const first = ip.split(".").map((x) => parseInt(x, 10));
  const last  = wild.map((x, i) => x + first[i]);

  const totalhosts = 1 +
      (last[0] - first[0] << 24)
    + (last[1] - first[1] << 16)
    + (last[2] - first[2] << 8)
    + (last[3] - first[3] << 0);

  return [
    netmask.join("."),
    wild.join("."),
    first.join("."),
    last.join("."),
    totalhosts,
  ];
}

function update() {
  const elm = document.getElementById("cidr");

  const [netmask, wild, first, last, total] = parseCIDR(elm.value);

  document.getElementById("netmask").value = netmask;
  document.getElementById("wild").value = wild;
  document.getElementById("first").value = first;
  document.getElementById("last").value = last;
  document.getElementById("total").value = total;
}

document.getElementById('click').addEventListener('click', update)
