#!/bin/bash
sed -i '1s/^/@custom-variant dark (\&:is(.dark *));\n/' src/index.css
