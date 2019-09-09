class IPv4 {
  static OctetsToInt(octets) {
    const ret = (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
    return ret >>> 0; // cast to unsigned
  }

  static IntToOctets(i) {
    return [
      (i >>> 24) & 0xFF,
      (i >>> 16) & 0xFF,
      (i >>> 8)  & 0xFF,
      (i >>> 0)  & 0xFF,
    ];
  }

  static IntToString(i) {
    return this.OctetsToString(this.IntToOctets(i));
  }

  static StringToOctets(s) {
    return s.split(".").map((x) => parseInt(x, 10))
  }

  static OctetsToString(octets) {
    return octets.join(".")
  }

  static IntToBits(i) {
    const mask = [...Array(32).keys()].reverse().map((x) => 1<<x);
    const bits = mask.map((x) => i & x).map((x) => x != 0).map(Number);
    return bits.join("");
  }
}

class Cidr {
  static Parse(cidr) {
    const [ip, range] = cidr.split("/");
    const upperBitsNum = parseInt(range, 10);

    const bitmask = "1".repeat(upperBitsNum) + "0".repeat(32-upperBitsNum);

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

  static FromIpRange(start, end) {
    const ret = [];
    const iMask = function(s) {
      return (2**32 - 2**(32-s));
    }

    while (end >= start) {
        let maxSize = 32;
        while (maxSize > 0) {
            const mask = iMask(maxSize-1);
            const maskBase = (start & mask)>>>0;
            if (maskBase != start) {
                break;
            }
            maxSize -= 1;
        }

        const x = Math.log(end - start + 1) / Math.log(2);
        const maxDiff = Math.floor(32 - Math.floor(x));

        if (maxSize < maxDiff) {
            maxSize = maxDiff;
        }

        ret.push([IPv4.IntToString(start), maxSize].join("/"));
        start += 2**(32-maxSize);
    }

    return ret;
  }
}

function updateCidr() {
  const elm = document.getElementById("cidr");

  const [netmask, wild, first, last, total] = Cidr.Parse(elm.value);

  document.getElementById("netmask").value = netmask;
  document.getElementById("wild").value = wild;
  document.getElementById("first").value = first;
  document.getElementById("last").value = last;
  document.getElementById("total").value = total;
}

function updateIpRange() {
  const start = document.getElementById("ip-start");
  const end = document.getElementById("ip-end");

  const istart = IPv4.OctetsToInt(IPv4.StringToOctets(start.value));
  const iend   = IPv4.OctetsToInt(IPv4.StringToOctets(end.value));

  const cidrs = Cidr.FromIpRange(istart, iend);

  document.getElementById("ip-cidr-result").value = cidrs.join("\n");
}

document.getElementById('calc-cidr').addEventListener('click', updateCidr)
document.getElementById('calc-range').addEventListener('click', updateIpRange)

