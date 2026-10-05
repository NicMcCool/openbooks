import { Box } from "@mantine/core";

// Decorative and deliberately quiet: this clerk does not interrupt searches.
export default function LibraryKeeper({ size = 240 }: { size?: number }) {
  return (
    <Box
      aria-hidden="true"
      sx={{ width: size, maxWidth: "100%", flexShrink: 0 }}>
      <svg
        viewBox="0 0 260 210"
        width="100%"
        style={{ display: "block" }}
        fill="none">
        <ellipse
          cx="133"
          cy="188"
          rx="102"
          ry="7"
          fill="#748399"
          opacity=".13"
        />
        <g
          stroke="#8fb3e4"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity=".7">
          <path d="M28 63v10m-5-5h10M216 30v8m-4-4h8M222 102v12m-6-6h12" />
          <path d="M49 31l3 5-3 5-3-5zM182 14l3 5-3 5-3-5z" />
          <path d="M32 125c-9-14-1-25 8-28" strokeDasharray="3 5" />
        </g>
        <g transform="rotate(5 204 169)" stroke="#748399" strokeWidth="2">
          <rect x="163" y="169" width="74" height="13" rx="3" fill="#3264a5" />
          <path d="M171 173h59m-59 4h59" opacity=".65" />
          <rect x="172" y="153" width="59" height="14" rx="2" fill="#303d50" />
          <path d="M180 157h42m-42 5h42" />
        </g>
        <path
          d="M183 131h27v15c0 12-27 12-27 0z"
          fill="#c4cdd9"
          stroke="#748399"
          strokeWidth="2"
        />
        <path d="M210 135c17-3 16 14 0 11" stroke="#c4cdd9" strokeWidth="4" />
        <path
          d="M189 154h30"
          stroke="#8fb3e4"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M193 122c-11-13 12-11 1-25m9 22c-5-8 7-10 3-18"
          stroke="#9daabd"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M87 156l-9 25-16 2m60-24 11 21 15 2"
          stroke="#9daabd"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform="rotate(-9 103 101)">
          <rect
            x="64"
            y="46"
            width="89"
            height="116"
            rx="5"
            fill="#d8dee5"
            stroke="#748399"
            strokeWidth="2"
          />
          <path d="M72 52h75m-75 5h75m-75 5h75" stroke="#9daabd" />
          <path d="M130 49v29l-7-5-7 5V49" fill="#8fb3e4" stroke="#3264a5" />
          <rect
            x="55"
            y="59"
            width="91"
            height="109"
            rx="5"
            fill="#28528a"
            stroke="#8fb3e4"
            strokeWidth="2"
          />
          <path d="M67 60v107" stroke="#8fb3e4" strokeWidth="2" />
          <path d="M77 73h56v79H77z" stroke="#8fb3e4" opacity=".45" />
          <path
            d="M83 83h19m7 0h17"
            stroke="#b7cff0"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx="93"
            cy="107"
            r="11"
            fill="#192332"
            stroke="#c4cdd9"
            strokeWidth="2"
          />
          <circle
            cx="119"
            cy="107"
            r="11"
            fill="#192332"
            stroke="#c4cdd9"
            strokeWidth="2"
          />
          <path
            d="M104 106h4m-27-2-11-5m61 5 9-5"
            stroke="#c4cdd9"
            strokeWidth="2"
          />
          <circle cx="97" cy="107" r="3" fill="#e5eaf1" />
          <circle cx="122" cy="107" r="3" fill="#e5eaf1" />
          <path
            d="M102 130c5 2 10 1 13-2"
            stroke="#b7cff0"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M89 146h34" stroke="#8fb3e4" strokeWidth="2" />
        </g>
        <path
          d="M149 114q18 5 27 20m-121-21q-21 6-17 22"
          stroke="#9daabd"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="m173 133 7-2m-7 2 5 5"
          stroke="#9daabd"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
}
