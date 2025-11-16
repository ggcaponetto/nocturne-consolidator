# nocturne-consolidator

Simple utility to consolidate all your NIGHT into one address.

[https://www.midnight.gd/news/how-to-consolidate-allocations-from-multiple-addresses-for-scavenger-mine](https://www.midnight.gd/news/how-to-consolidate-allocations-from-multiple-addresses-for-scavenger-mine)

## Donations for nocturne-consolidator

This utility is free (no embedded donations) and open source. If you find this tool useful, consider supporting me with a donation:

`addr1q9qeztx4dj4p3u9da75j37psg955ch97epr3sg5qt7m7t9kdg29j4u98m9zj52dqwdfc52y9sasscencvsldyzqu0ljqu6dtgr`

Feel free to reach out for support on Discord (G-CELL / gcell8155). People donating will get priority support.

## Donations for nocturne miner developers

Shoutout to [MGpai](https://github.com/mgpai22) and [nkz](https://x.com/nkzthecreator) for the nocturne miner. Note that the official nocturne miner will have its own consolidation solution. This script is an alternative option. Consider donating some ADA to them as well!

``addr1q9qeztx4dj4p3u9da75j37psg955ch97epr3sg5qt7m7t9kdg29j4u98m9zj52dqwdfc52y9sasscencvsldyzqu0ljqu6dtgr``

## Prerequisites

- Install [Node.js](https://nodejs.org/en/download)
- Install [Git](https://git-scm.com/install/)

## Installation

```bash
git clone https://github.com/yourusername/nocturne-consolidator.git
cd nocturne-consolidator
npm i
npm run build
npm run test:run
```

## Setup

Create an `input.json` file in the root directory with the following structure:

```json
{
  "recipientAddress": "addr1...",
  "nocturne-miners": [
    {
      "id": "asdfe-asdfe",
      "mnemonic": "mix safe clap..."
    },
    {
      "id": "asdfe-asdfe",
      "mnemonic": "mix safe clap..."
    }
  ]
}
```

see ``input.sample.json`` for an example. **The recipientAddress is the address you will donate all your NIGHT to.**

## Usage

```powershell
npx tsx src/index.ts --input-file input.json *>&1 | Tee-Object -FilePath output.log
```

```bash
npx tsx src/index.ts --input-file input.json > output.log 2>&1 | tee output.log
```

This utility will download all the miner statistics from the Nocturne API and save each
miner statistics into a directory named ``stats-output``. Then it will proceed to donate all the NIGHT.

This execution will create a ``donate.log`` file with detailed logs where you can check for status codes
and make sure everything went well. To do this just search the occurence of `status":200` after a
first run or `status":409` subsequent runs (409 means the NIGHT has already been donated).


## Disclaimer

This script is provided "as is", without warranty of any kind, express or implied. Use at your own risk. The author assumes no responsibility or liability for any errors, losses, or damages that may result from using this software.

