/CREATE TABLE/ {
  first_col = match($0, /\(.*\)/ );

  if (first_col) {
    lst_columns = "";
    num_columns = split(substr($0, RSTART + 1, RLENGTH), a, ", ");

    for (i = 1; i <= num_columns; i++) {
      split(a[i], names, " ");
      lst_columns = lst_columns (length(lst_columns) == 0 ? "" : ", ") names[1];
    }

    gsub(/`/, "\"", lst_columns);
  }
}

/INSERT INTO \"[A-Za-z0-9]+\"/ {
  match($0, /INSERT INTO \"[A-Za-z0-9]+\"/);

  insert_part = substr($0, RSTART, RLENGTH);
  values_part = substr($0, RLENGTH+1, length($0) - RSTART);

  printf("%s (%s)%s\n", insert_part, lst_columns, values_part);
}
