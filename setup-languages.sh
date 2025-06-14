#!/bin/bash

#ocaml

sh <(curl -sL \
https://raw.githubusercontent.com/ocaml/opam/master/shell/install.sh)
opam init --bare
opam switch create 5.3.0
eval $(opam env)
opam install ocaml-lsp-server dune utop mparser ocamlformat ounit2 qcheck
