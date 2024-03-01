# Migration of blog.odd-e.com

Current blog is hosted on `www` and uses Movable Type (v5) and MySQL (v5), both too old and unsupported.
The plan is to move the blog to `fluxparty` k8s cluster and use <https://ghost.org> as a modern blogging platform.


## Steps

0. Backup data
  - MySQL DB on `infra` (in case we need to use it temporarily while waiting for Linode's managed DB serice): `GDrive/Backups/20240220-infra-mysqldump.sql.gz`.
  - Movable Type admin export: `GDrive/Backups/20240219_odde-blog-movable-type-backup.tar.gz`

1. Run migration

  ```bash
  git clone git@github.com:nerds-odd-e/blog-migrate.git
  cd blog-migrate
  yarn
  NODE_ENV=production node index.js $MT_BACKUP_FILE
  ```
To test locally, set `NODE_ENV=test`, or just remove the env var.

2. Test locally

  - `docker-compose up`
  - Go to `http://localhost:8080/ghost/`. Create admin account if 1st time. Then go to Settings -> Advanced -> Lab -> Import and upload `output/blog.zip`.

3. Configuration
There should be a .env file (for testing purpose) in the root of the project to configure host and s3. The file should look like this:

```bash
BLOG_HOST=http://localhost:8080
BLOG_STORAGE=s3
BLOG_STORAGE_ACCESS_KEY_ID=AccessKeyId
BLOG_STORAGE_SECRET_ACCESS_KEY=SecretAccessKey
BLOG_STORAGE_REGION=Region
BLOG_STORAGE_BUCKET=Bucket
BLOG_STORAGE_ASSET_HOST=Url to access the files leading with //
BLOG_STORAGE_ENDPOINT=Endpoint without the protocol and bucket
```
When running for production, the .env.production file should be in the root of the project.
