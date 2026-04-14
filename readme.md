
==============================================================================
GIT
⚡ Short command cheat sheet

Workflow:

git checkout dev
git checkout -b feature-x

When done:

git push origin feature-x
git checkout dev
git merge feature-x
git push

After a successful deploy:

git checkout main
git merge dev
git push

==============================================================================

IP:89.168.87.13

==============================================================================

git pull (git clone)

<SERVER>
.env
npm i

<CLIENT>
client/.env
rm -r dist
npm i
npm run build

<DEPLOY CLIENT>
scp -r dist ubuntu@89.168.87.13:/home/ubuntu/mvp3dcursor/client