git ls-files | while read path;
do
   touch -d "$(git log -1 --format="@%ct" "$path")" "$path";
done;