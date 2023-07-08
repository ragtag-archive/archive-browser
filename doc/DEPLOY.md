# Deploy Instructions

The following are instructions to deploy the frontend manually. If you want to
get things up and running quickly, a dockerized setup is available at
[aonahara/archive-docker](https://gitlab.com/aonahara/archive-docker).

For a minimum deployment, this frontend requres the following to function:

- An Elasticsearch 7.11 database
- A separate URL to serve files

## Preparation

### Create the database

Set up an Elasticsearch 7.11 database. You can quickly deploy it using Docker:

```bash
$ docker run -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.11.2
```

Note, the above command creates a **temporary** database for testing. All data
**will be gone** after a reboot. For more information, including how to deploy
the database persistently, refer to the
[official documentation](https://www.elastic.co/guide/en/elasticsearch/reference/7.11/docker.html).

Once the database is up, you should be able to query it like so:

```bash
$ curl http://localhost:9200
```

Which should yield an output similar to this:

```json
{
  "name": "my-instance",
  "cluster_name": "my-cluster",
  "cluster_uuid": "...",
  "version": {
    "number": "7.11.2",
    "build_flavor": "default",
    "build_type": "docker",
    "build_hash": "...",
    "build_date": "...",
    "build_snapshot": false,
    "lucene_version": "8.7.0",
    "minimum_wire_compatibility_version": "6.8.0",
    "minimum_index_compatibility_version": "6.0.0-beta1"
  },
  "tagline": "You Know, for Search"
}
```

If you see that output, the database is ready.

### Create indices and mappings

You should see JSON files in the `doc/indices` folder of this repository. Those
files contain the mappings and settings necessary to create the indices. To
create the indices, run the `create_indices` script:

```bash
node ./create_indices.js http://localhost:9200
```

The database is now ready.

### Prepare the file server

The frontend expects a file server which serves data with the following
structure:

```
/
  <video_id>/
    <video_id>.chat.json
    <video_id>.mkv
    <video_id>.f248.webm
    <video_id>.f251.webm
    <video_id>.webp
  <channel_id>/
    profile.jpg
```

For instance, if your files are served from
`https://archive-content.ragtag.moe/`, the frontend will attempt to fetch
channel profile images from
`https://archive-content.ragtag.moe/UCRMpIxnySp7Fy5SbZ8dBv2w/profile.jpg`. Video
thumbnails will be fetched from
`https://archive-content.ragtag.moe/tE-J5q8OCF0/tE-J5q8OCF0.webp`, and so on.

Videos on the `/watch?v=` page are streamed, so make sure your file server
accepts the `Range` header to allow for seeking. You should also make sure to
include appropriate CORS headers if you decide to host the files under a
different domain name.

You can use a webserver such as `nginx` for this purpose. But for testing, let's
use a temporary server using the `http-server` package from npm. Run the
following command in the folder which contains the files as described above.

```
$ npx http-server -p 8080 --cors
```

The above command will create a basic HTTP file server, which will serve files
from the current folder.

### Updating the configuration

Open up the file `./modules/shared/config.ts`. You should see various options,
its descriptions, and sometimes its default value. To override the options, you
can set environment variables using a file called `.env.local`. Create the file
`.env.local` in this project directory and fill it in with the following values:

```
ES_INDEX=youtube-archive
ES_BACKEND_URL=http://localhost:9200
ES_AUTHORIZATION=
DRIVE_BASE_URL=http://localhost:8080
ENABLE_SIGN_URLS=false
```

### Insert some data

For the website to be useful, you should have some data in your Elasticsearch
database. Create the file `data.json` with the following content:

```json
{
  "video_id": "Y1So82y91Yw",
  "channel_name": "フブキCh。白上フブキ",
  "channel_id": "UCdn5BQ06XqgXoAxIhbqw5Rg",
  "upload_date": "2019-10-24",
  "title": "Im. Scatman",
  "description": "im scatman",
  "duration": 57,
  "width": 886,
  "height": 1920,
  "fps": 30,
  "format_id": "313+140",
  "view_count": 3466630,
  "like_count": 202661,
  "dislike_count": 2723,
  "files": [
    {
      "name": "Y1So82y91Yw.info.json",
      "size": 286517
    },
    {
      "name": "Y1So82y91Yw.mkv",
      "size": 26116973
    },
    {
      "name": "Y1So82y91Yw.jpg",
      "size": 78964
    },
    {
      "name": "Y1So82y91Yw.f313.webm",
      "size": 25182161
    },
    {
      "name": "Y1So82y91Yw.f140.m4a",
      "size": 916875
    },
    {
      "name": "Y1So82y91Yw.webp",
      "size": 34392
    }
  ],
  "archived_timestamp": "2021-03-15T02:31:17.878Z"
}
```

Then perform the insert:

```bash
$ curl -XPUT -H 'Content-Type: application/json' -d '@data.json' http://localhost:9200/youtube-archive/_doc/Y1So82y91Yw
```

Be sure to also grab all the files and put them in the folder where you did the
`npx http-server` thing. You can get the files from
[here](https://archive.ragtag.moe/watch?v=Y1So82y91Yw). Click the three dots
besides the Download button to get the various files.

## Run it!

Once everything is prepared, run `yarn` to install all the dependencies. When
done, run `yarn dev` to start a dev server. If successful, you should be able to
open `http://localhost:3000` in your browser and see the video you just
inserted.
