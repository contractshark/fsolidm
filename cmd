for i in ../data/data-nuXmv-2.0.0-*; do ln -s script.pl `basename $i |cut -f2- -d-`; done
