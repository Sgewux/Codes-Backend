#!/bin/bash

dir=$1;
codefile=$2;
time_limit=$3;

compile=$(g++ -o "$dir"main.exe  "$dir""$codefile" &> "$dir"log.txt);
compiler_exit_code=$?;

if [ $compiler_exit_code -eq 0 ];
then    
        start_time=`date +%s%N`;
        exc=$(timeout "$time_limit"  "$dir"main.exe < "$dir"in.txt > "$dir"out.txt);
        exec_exit=$?;
        end_time=`date +%s%N`;
        
        echo `expr $end_time / 1000000 - $start_time / 1000000`; 

        exit $exec_exit;
else
        exit 1;
fi