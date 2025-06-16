#!/bin/bash

git add .

if git diff --cached --quiet; then
    git commit --allow-empty -m "A push as a tribute to the only god of performance: ARTEMIS"
else
    git commit -m "."
fi

git push
