# marin-stageplayer-embed
Multi-container composed docker application, that can be integrated into mediamix-pydio

## Installation

Edit .env.example to fit server configuration. Has following options:

NODE_ENV: The environment in which node/webpack runs, leave this in production unless you plan on debugging the embedding application. 

HOST_ASSET_ROOT: The directory on the server that will serve as the root for the assets. Will be used as asset root for containers.

