# MangaFlux Branch Workflow

## Active branches

MangaFlux uses two intentional branches for normal development:

~~~text
main
kenn/develop
~~~

### main

Production/deployable branch. Do not push unreviewed feature work directly to `main`.

### kenn/develop

The single persistent ChatGPT-assisted development branch.

For each logical update:

1. Reset `kenn/develop` to current `main`.
2. Create one coherent implementation commit on `kenn/develop`.
3. Open a PR from `kenn/develop` to `main`.
4. Wait for all CI checks.
5. Squash-merge only when green.
6. Reset `kenn/develop` to the new `main` merge commit.
7. Reuse the same branch next time.

Do not create `kenn/v1.1.0`, `kenn/fix-*`, or other one-off version branches.

Dependabot branches are managed by GitHub and are not part of the MangaFlux development-branch rule.

Historical merged `kenn/*` branches can be deleted because their merged PR/commit history remains in GitHub.
