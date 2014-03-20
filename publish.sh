git checkout gh-pages
git reset origin/master --hard
npm install
npm run generate
mkdir delete-me
mv * delete-me/
mv delete-me/public/* ./
rm -rf delete-me
git add -A .
git commit -m 'Auto published'
git push origin gh-pages
git checkout master