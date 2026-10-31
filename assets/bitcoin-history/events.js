/* Source data for the generated, fully readable HTML timeline. */
window.BITCOIN_HISTORY = {
  "asOf": "2026-10-31",
  "events": [
    {
      "id": "white-paper",
      "date": "31 October 2008",
      "year": "2008",
      "short": "The white paper",
      "title": "An idea arrives in an inbox.",
      "body": "Someone using the name Satoshi Nakamoto shares a nine-page paper with a cryptography mailing list. It describes how people could send electronic payments directly to one another, using a shared record and proof of work instead of a central operator.",
      "why": "Bitcoin brought earlier cryptographic ideas together into a design for preventing the same digital money from being spent twice without a trusted intermediary.",
      "perspective": "This was a proposal, not yet a running network. Satoshi’s real-world identity remains unproven.",
      "kind": "paper",
      "stat": "9",
      "unit": "pages. A different starting point.",
      "sources": [
        {
          "label": "Read Satoshi’s announcement",
          "url": "https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html"
        },
        {
          "label": "Read the original paper",
          "url": "https://bitcoin.org/bitcoin.pdf"
        }
      ],
      "sort": "2008-10-31",
      "category": "Origins",
      "summary": "A nine-page proposal introduces peer-to-peer electronic cash."
    },
    {
      "id": "genesis",
      "date": "3 January 2009",
      "year": "2009",
      "short": "The genesis block",
      "title": "The first block. The beginning of the chain.",
      "body": "Satoshi creates block zero, known as the genesis block. Embedded inside is a headline from The Times about a second bank bailout. The software becomes publicly available later that month, allowing others to join.",
      "why": "The idea now has a starting record. Every later Bitcoin block ultimately connects back to this one.",
      "perspective": "The genesis block’s 50 BTC output cannot be spent. The newspaper headline is real; interpretations of Satoshi’s full intentions are still interpretations.",
      "kind": "block",
      "stat": "000000",
      "unit": "the chain begins at block zero.",
      "sources": [
        {
          "label": "Bitcoin Core’s genesis-block code",
          "url": "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"
        },
        {
          "label": "Explore block 0",
          "url": "https://mempool.space/block/0"
        }
      ],
      "sort": "2009-01-03",
      "category": "Origins",
      "summary": "Block zero anchors the chain that follows."
    },
    {
      "id": "software-release",
      "sort": "2009-01-08",
      "date": "8 January 2009",
      "year": "2009",
      "short": "Bitcoin v0.1 is released",
      "title": "Bitcoin v0.1 is released",
      "category": "Origins",
      "summary": "The experiment becomes software that other people can run.",
      "body": "Satoshi announces the first public Bitcoin software release on the cryptography mailing list. It includes the C++ source code and a Windows program that connects to peers, processes transactions and lets users mine.",
      "why": "Other people can inspect the implementation and join the network; Bitcoin no longer exists only as a paper.",
      "perspective": "The announcement calls it experimental software. Its mailing-list timestamp is 8 January in Eastern time; the genesis block predates this release.",
      "kind": "paper",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Satoshi’s release announcement",
          "url": "https://www.metzdowd.com/pipermail/cryptography/2009-January/014994.html"
        }
      ]
    },
    {
      "id": "hal-finney",
      "date": "12 January 2009 · UTC",
      "year": "2009",
      "short": "Satoshi → Hal Finney",
      "title": "Digital money moves between two people.",
      "body": "Satoshi sends 10 BTC to developer Hal Finney in block 170. Finney later recalls participating in this first Bitcoin transfer while helping test the new software.",
      "why": "The first recorded person-to-person Bitcoin transfer demonstrates the most basic promise: one person can send value to another on the network.",
      "perspective": "This is different from mining new coins—and different from buying something with them. The pizza purchase is still more than a year away.",
      "kind": "transfer",
      "stat": "10 BTC",
      "unit": "Satoshi → Hal Finney",
      "sources": [
        {
          "label": "Hal Finney’s first-person account",
          "url": "https://bitcointalk.org/index.php?topic=155054.0"
        },
        {
          "label": "Explore block 170",
          "url": "https://mempool.space/block/170"
        }
      ],
      "sort": "2009-01-12",
      "category": "People",
      "summary": "Satoshi sends 10 BTC to Hal Finney in the first recorded person-to-person transfer."
    },
    {
      "id": "pizza",
      "date": "22 May 2010",
      "year": "2010",
      "short": "The two-pizza purchase",
      "title": "Two pizzas. One very memorable exchange.",
      "body": "Laszlo Hanyecz confirms that he has traded 10,000 BTC for two pizzas, after posting an offer on the Bitcoin forum. Another participant arranges the pizza order in return for the bitcoin.",
      "why": "This widely documented early purchase makes an abstract idea tangible: people are willing to exchange Bitcoin for something in the everyday world.",
      "perspective": "It was not the first Bitcoin transfer. And converting those coins into today’s price misses the point: early spending helped people discover whether Bitcoin could be useful.",
      "kind": "pizza",
      "stat": "10,000 BTC",
      "unit": "exchanged for two pizzas.",
      "sources": [
        {
          "label": "Read the original pizza thread",
          "url": "https://bitcointalk.org/index.php?topic=137.0"
        }
      ],
      "sort": "2010-05-22",
      "category": "Adoption",
      "summary": "Laszlo Hanyecz exchanges 10,000 BTC for two pizzas."
    },
    {
      "id": "mt-gox-opens",
      "sort": "2010-07-18",
      "date": "18 July 2010",
      "year": "2010",
      "short": "Early exchanges find a market",
      "title": "Early exchanges find a market",
      "category": "Markets",
      "summary": "Mt. Gox introduces its Bitcoin exchange on the forum.",
      "body": "Mt. Gox announces a new exchange, joining the early services through which people can trade bitcoin. A network that began among experimenters is developing a market infrastructure around it.",
      "why": "Buying and selling becomes easier, while companies begin to sit between users and the underlying network.",
      "perspective": "This is an early exchange milestone, not a claim that Mt. Gox was the first Bitcoin market. Its later failure belongs to a different point on this timeline.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the exchange’s original announcement",
          "url": "https://bitcointalk.org/index.php?topic=444.0"
        }
      ]
    },
    {
      "id": "overflow-bug",
      "sort": "2010-08-15",
      "date": "15 August 2010",
      "year": "2010",
      "short": "A critical inflation bug is repaired",
      "title": "A critical inflation bug is repaired",
      "category": "Security",
      "summary": "An overflow bug permits an invalid creation of coins; developers respond with a fix.",
      "body": "An arithmetic overflow in transaction validation is exploited in block 74,638. Developers release corrected software and the network reorganizes onto a chain that excludes the offending transaction.",
      "why": "The episode is a reminder that Bitcoin’s rules must be correctly implemented in software, not merely written down.",
      "perspective": "The erroneous coins are not part of the accepted chain. This historical incident is why sweeping claims that Bitcoin has never had a serious software failure are misleading.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the original incident thread",
          "url": "https://bitcointalk.org/index.php?topic=822.0"
        }
      ]
    },
    {
      "id": "pooled-mining",
      "sort": "2010-11-27",
      "date": "27 November 2010",
      "year": "2010",
      "short": "Pooled mining takes shape",
      "title": "Pooled mining takes shape",
      "category": "Mining",
      "summary": "Slush proposes cooperative mining to share the work and the rewards.",
      "body": "Marek Palatinus, known as Slush, opens a discussion of cooperative mining. Combining computing power offers miners a way to receive smaller, more regular payouts rather than wait alone for a whole block reward.",
      "why": "Pools become an important layer of mining coordination, making participation more predictable while introducing new concentration questions.",
      "perspective": "The date marks the original proposal thread, not a claim that every later pool feature was ready that day. A pool’s operator and its participating miners are also different actors.",
      "kind": "block",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "url": "https://bitcointalk.org/index.php?topic=1976.0",
          "label": "Read the original cooperative-mining thread"
        }
      ]
    },
    {
      "id": "satoshi-last-post",
      "sort": "2010-12-12",
      "date": "12 December 2010",
      "year": "2010",
      "short": "Satoshi’s last public forum post",
      "title": "Satoshi’s last public forum post",
      "category": "People",
      "summary": "The creator’s final known forum post discusses software maintenance.",
      "body": "Satoshi posts about denial-of-service protections and a new software build. It is the last known public post from Satoshi’s original Bitcoin forum account; private correspondence continues afterward.",
      "why": "The project’s future increasingly rests with a wider group of contributors rather than its original author.",
      "perspective": "Leaving public discussion is not the same as a known date of disappearance. The post does not establish Satoshi’s identity or explain their later silence.",
      "kind": "paper",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Satoshi’s forum post",
          "url": "https://bitcointalk.org/index.php?topic=2228.msg29479#msg29479"
        }
      ]
    },
    {
      "id": "namecoin",
      "sort": "2011-04-18",
      "date": "18 April 2011",
      "year": "2011",
      "short": "Namecoin branches from the code",
      "title": "Namecoin branches from the code",
      "category": "Forks & governance",
      "summary": "Bitcoin’s open-source design inspires a separate naming-system blockchain.",
      "body": "Namecoin is announced as a distributed naming system based on Bitcoin. Its original announcement explicitly describes a new blockchain, separate from Bitcoin’s main chain.",
      "why": "This is an early example of a code fork: reusing and modifying software to create a different network.",
      "perspective": "A code fork is different from a later chain split such as Bitcoin Cash, which shares Bitcoin’s transaction history up to a divergence point.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Namecoin’s original announcement",
          "url": "https://bitcointalk.org/index.php?topic=6017.0"
        }
      ]
    },
    {
      "id": "litecoin",
      "sort": "2011-10-01",
      "date": "October 2011",
      "year": "2011",
      "short": "Litecoin launches a separate network",
      "title": "Litecoin launches a separate network",
      "category": "Forks & governance",
      "summary": "Another early project adapts Bitcoin’s code with different design choices.",
      "body": "Charlie Lee introduces Litecoin, using Bitcoin-derived software with changes including a different proof-of-work algorithm and a shorter target block interval.",
      "why": "Open-source money produces alternatives. A similar codebase does not require a shared currency, ledger or community.",
      "perspective": "Litecoin did not divide existing BTC balances into two Bitcoin histories. It launched a separate chain. The announcement was posted on 9 October; launch preparations continued afterward.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Litecoin’s launch thread",
          "url": "https://bitcointalk.org/index.php?topic=47417.0"
        }
      ]
    },
    {
      "id": "p2sh",
      "sort": "2012-04-01",
      "date": "1 April 2012",
      "year": "2012",
      "short": "P2SH makes complex wallets more practical",
      "title": "P2SH makes complex wallets more practical",
      "category": "Protocol",
      "summary": "Pay-to-script-hash supports simpler payment addresses for more complex spending conditions.",
      "body": "BIP 16 introduces pay-to-script-hash validation rules. A sender can pay a compact address while the recipient supplies the spending script when the funds are later spent.",
      "why": "Arrangements such as multisignature wallets become easier to fund without making the sender handle all the underlying conditions.",
      "perspective": "P2SH is a soft fork: a tighter set of validation rules. It creates neither a separate coin nor an investment return.",
      "kind": "layers",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read BIP 16",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki"
        }
      ]
    },
    {
      "id": "first-halving",
      "date": "28 November 2012 · UTC",
      "year": "2012",
      "short": "The first halving",
      "title": "A rule in the code becomes a real event.",
      "body": "At block 210,000, the subsidy for each new block falls from 50 BTC to 25 BTC. This is the first halving: a scheduled reduction in how quickly new bitcoin enters circulation.",
      "why": "The issuance schedule is enforced by the network’s rules. It does not depend on a committee deciding how much new money to create.",
      "perspective": "The subsidy halves every 210,000 blocks, roughly every four years. Transaction fees are separate, and a reduction in new supply does not guarantee a price increase.",
      "kind": "halving",
      "stat": "50 → 25",
      "unit": "BTC subsidy per block.",
      "sources": [
        {
          "label": "Explore block 210,000",
          "url": "https://mempool.space/block/210000"
        },
        {
          "label": "Read the issuance rules",
          "url": "https://github.com/bitcoin/bitcoin/blob/master/src/validation.cpp"
        }
      ],
      "sort": "2012-11-28",
      "category": "Monetary policy",
      "summary": "The block subsidy falls from 50 to 25 BTC."
    },
    {
      "id": "asic-mining",
      "sort": "2013-01-01",
      "date": "January 2013",
      "year": "2013",
      "short": "Specialized mining hardware arrives",
      "title": "Specialized mining hardware arrives",
      "category": "Mining",
      "summary": "Commercial ASIC miners change the economics of securing Bitcoin.",
      "body": "Avalon’s first ASIC-based mining product arrives in January 2013. Chips designed specifically for Bitcoin mining bring a major shift away from general-purpose computing hardware.",
      "why": "Mining becomes an increasingly specialized activity, with manufacturing, electricity and equipment access playing larger roles.",
      "perspective": "More computing power is not the same as more independent participants. Hardware concentration and the cost of entry remain separate questions.",
      "kind": "block",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the manufacturer’s history",
          "url": "https://www.canaan.io/news/origins-seeking-1st-gen-hash-king-of-avalon-miner-1490"
        }
      ]
    },
    {
      "id": "chain-split",
      "date": "March 2013",
      "year": "2013",
      "short": "An accidental chain split",
      "title": "The network encounters a serious test.",
      "body": "Different Bitcoin software versions disagree about a block, temporarily creating two competing chains. Developers, miners and services coordinate a response; major mining pools return to the older software to restore a common chain.",
      "why": "The incident exposes how software details can become consensus rules—and why careful testing and coordination matter.",
      "perspective": "Decentralized does not mean free of bugs or human judgment. Bitcoin’s own post-mortem documents the failure and the changes made afterward.",
      "kind": "fork",
      "stat": "2 → 1",
      "unit": "competing chains, then a common record.",
      "sources": [
        {
          "label": "Read the developer post-mortem · BIP 50",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0050.mediawiki"
        }
      ],
      "sort": "2013-03-11",
      "category": "Security",
      "summary": "Two software versions disagree, briefly splitting the network."
    },
    {
      "id": "fincen",
      "sort": "2013-03-18",
      "date": "18 March 2013",
      "year": "2013",
      "short": "U.S. rules reach virtual-currency businesses",
      "title": "U.S. rules reach virtual-currency businesses",
      "category": "Policy",
      "summary": "FinCEN distinguishes users from certain administrators and exchangers.",
      "body": "FinCEN issues guidance explaining how existing U.S. money-services-business rules apply to convertible virtual currencies. It distinguishes ordinary users from certain businesses administering or exchanging them.",
      "why": "The services around Bitcoin face legal obligations even though the network itself has no central company.",
      "perspective": "This describes the historical guidance, not a complete statement of today’s legal requirements or advice about a particular business.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read FinCEN’s announcement",
          "url": "https://www.fincen.gov/news/news-releases/fincen-issues-guidance-virtual-currencies-and-regulatory-responsibilities"
        }
      ]
    },
    {
      "id": "silk-road",
      "sort": "2013-10-02",
      "date": "October 2013",
      "year": "2013",
      "short": "Silk Road is shut down",
      "title": "Silk Road is shut down",
      "category": "Policy",
      "summary": "A high-profile illicit marketplace becomes a defining early controversy.",
      "body": "Authorities shut down Silk Road, a darknet marketplace operating since 2011, and seize bitcoin connected with the case. Ross Ulbricht is arrested on 1 October; the website seizure is publicly announced that week.",
      "why": "The case shapes public perceptions of Bitcoin and shows that activity around a pseudonymous ledger can still be investigated.",
      "perspective": "Bitcoin is not anonymous by default. A criminal marketplace is one use of a network, not a complete description of everyone using it.",
      "kind": "custody",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the FBI’s account",
          "url": "https://www.fbi.gov/history/artifacts/ross-william-ulbrichts-laptop"
        }
      ]
    },
    {
      "id": "china-banks",
      "sort": "2013-12-05",
      "date": "5 December 2013",
      "year": "2013",
      "short": "China restricts financial institutions",
      "title": "China restricts financial institutions",
      "category": "Policy",
      "summary": "Banks and payment institutions face restrictions on Bitcoin-related activity.",
      "body": "Chinese authorities restrict financial institutions’ involvement in Bitcoin. The policy distinguishes Bitcoin as a virtual commodity from official currency and limits financial and payment services around it.",
      "why": "China becomes a recurring part of Bitcoin’s policy story, long before the 2021 mining crackdown.",
      "perspective": "Different Chinese measures target different activities at different times. A restriction on banks is not interchangeable with a later mining ban.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the U.S.–China Commission’s policy record",
          "url": "https://www.uscc.gov/sites/default/files/Research/USCC%20Economic%20Issue%20Brief%20-%20Bitcoin%20-%2005%2012%2014.pdf"
        }
      ]
    },
    {
      "id": "mt-gox",
      "date": "February 2014",
      "year": "2014",
      "short": "Mt. Gox collapses",
      "title": "An exchange fails. Bitcoin keeps running.",
      "body": "Mt. Gox, a major Bitcoin exchange, stops operating after losses come to light. Customers are left unable to access funds held by the company.",
      "why": "The collapse makes the difference between owning bitcoin and trusting an intermediary painfully concrete. A functioning blockchain cannot guarantee that an exchange holds what it owes.",
      "perspective": "Self-custody removes some intermediary risks but introduces responsibilities of its own, including secure backups and recovery planning.",
      "kind": "custody",
      "stat": "≠",
      "unit": "an exchange is not the network.",
      "sources": [
        {
          "label": "Contemporary U.S. Senate statement",
          "url": "https://www.hsgac.senate.gov/media/dems/chairman-carpers-statement-on-insolvency-of-major-bitcoin-exchange/"
        },
        {
          "label": "U.S. Justice Department case background",
          "url": "https://www.justice.gov/usao-ndca/pr/russian-nationals-charged-hacking-one-cryptocurrency-exchange-and-illicitly-operating"
        }
      ],
      "sort": "2014-02-25",
      "category": "Security",
      "summary": "A major exchange collapses, exposing the risks of leaving assets with an intermediary."
    },
    {
      "id": "irs-property",
      "sort": "2014-03-25",
      "date": "25 March 2014",
      "year": "2014",
      "short": "The IRS treats virtual currency as property",
      "title": "The IRS treats virtual currency as property",
      "category": "Policy",
      "summary": "U.S. tax guidance applies existing property principles to Bitcoin transactions.",
      "body": "IRS Notice 2014-21 explains that virtual currency is treated as property for U.S. federal tax purposes and addresses examples involving payments, mining and exchanges.",
      "why": "Using bitcoin to pay can have recordkeeping and tax implications beyond the payment itself.",
      "perspective": "This is a historical policy milestone. Later guidance, legislation and individual circumstances can affect current tax treatment; the timeline is not tax advice.",
      "kind": "block",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "url": "https://www.irs.gov/irb/2014-16_IRB",
          "label": "Read Notice 2014-21 in the IRS bulletin"
        }
      ]
    },
    {
      "id": "hardware-wallets",
      "sort": "2014-07-29",
      "date": "29 July 2014",
      "year": "2014",
      "short": "Hardware wallets reach users",
      "title": "Hardware wallets reach users",
      "category": "Security",
      "summary": "Trezor’s Model One brings dedicated key-storage hardware to market.",
      "body": "Trezor launches the Model One. Dedicated hardware offers a way to keep signing keys apart from the everyday computer used to prepare and broadcast payments.",
      "why": "Self-custody starts to develop a more accessible set of tools beyond software wallets alone.",
      "perspective": "A hardware device does not eliminate backup, phishing, recovery or inheritance risks. The surrounding process still matters.",
      "kind": "custody",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Trezor’s product history",
          "url": "https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-fundamentals"
        }
      ]
    },
    {
      "id": "lightning-paper",
      "sort": "2015-02-01",
      "date": "February 2015",
      "year": "2015",
      "short": "The Lightning idea takes shape",
      "title": "The Lightning idea takes shape",
      "category": "Technology",
      "summary": "Joseph Poon and Thaddeus Dryja propose a network of payment channels.",
      "body": "The Lightning paper describes how linked payment channels could support payments without recording every individual exchange on Bitcoin’s base blockchain.",
      "why": "The scaling discussion extends beyond larger blocks to additional layers with different trade-offs.",
      "perspective": "A design paper is not a finished network. Implementations, testing, liquidity management and user experience take years to develop.",
      "kind": "lightning",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the Lightning paper",
          "url": "https://lightning.network/lightning-network.pdf"
        }
      ]
    },
    {
      "id": "blocksize-debate",
      "sort": "2015-06-22",
      "date": "22 June 2015",
      "year": "2015",
      "short": "The block-size debate becomes a protocol proposal",
      "title": "The block-size debate becomes a protocol proposal",
      "category": "Forks & governance",
      "summary": "BIP 101 proposes larger blocks. The disagreement is about much more than a number.",
      "body": "Gavin Andresen proposes BIP 101, replacing the fixed block-size limit with a growing maximum. Competing approaches, including Bitcoin XT and later Classic and Unlimited, make scaling a central governance dispute.",
      "why": "The argument connects payment capacity, fees, the cost of running a node and who gets to decide Bitcoin’s rules.",
      "perspective": "A proposal or alternative client is not automatically a new coin. BIP 101 did not become Bitcoin’s adopted consensus rule.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the original block-size proposal",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0101.mediawiki"
        }
      ]
    },
    {
      "id": "bitlicense",
      "sort": "2015-06-24",
      "date": "24 June 2015",
      "year": "2015",
      "short": "New York’s BitLicense takes effect",
      "title": "New York’s BitLicense takes effect",
      "category": "Policy",
      "summary": "A dedicated licensing framework emerges for virtual-currency businesses.",
      "body": "New York’s virtual-currency business regulation takes effect. The BitLicense framework adds licensing, compliance and operational requirements for covered businesses.",
      "why": "Jurisdiction begins to matter more visibly to the availability and design of Bitcoin services.",
      "perspective": "The rule applies to defined activities and businesses, not to every use of Bitcoin everywhere. Requirements have continued to evolve since 2015.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the regulator’s history",
          "url": "https://www.dfs.ny.gov/virtual_currency_businesses"
        }
      ]
    },
    {
      "id": "second-halving",
      "sort": "2016-07-09",
      "date": "9 July 2016 · UTC",
      "year": "2016",
      "short": "The second halving",
      "title": "The second halving",
      "category": "Monetary policy",
      "summary": "The block subsidy falls from 25 to 12.5 BTC at block 420,000.",
      "body": "The second scheduled halving reduces newly issued bitcoin in each block to 12.5 BTC.",
      "why": "The issuance schedule continues across another generation of miners, businesses and users.",
      "perspective": "The subsidy is only one part of mining revenue. A supply event does not determine demand or guarantee a market outcome.",
      "kind": "halving",
      "stat": "25 → 12.5",
      "unit": "BTC subsidy per block",
      "sources": [
        {
          "label": "Explore block 420,000",
          "url": "https://mempool.space/block/420000"
        }
      ]
    },
    {
      "id": "bitfinex",
      "sort": "2016-08-02",
      "date": "2 August 2016",
      "year": "2016",
      "short": "Bitfinex suffers a major theft",
      "title": "Bitfinex suffers a major theft",
      "category": "Security",
      "summary": "Another exchange breach reinforces the difference between a network and its custodians.",
      "body": "Bitfinex halts trading, deposits and withdrawals after discovering a security breach affecting Bitcoin wallets. Later criminal proceedings describe the theft of roughly 120,000 BTC.",
      "why": "Custody architecture and operational security remain critical even as the wider industry becomes more sophisticated.",
      "perspective": "This is a compromise of a service holding assets, not a change to Bitcoin’s supply rules or a break in its proof-of-work mechanism.",
      "kind": "custody",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Bitfinex’s contemporaneous notice",
          "url": "https://blog.bitfinex.com/announcements/security-breach/"
        }
      ]
    },
    {
      "id": "uasf-proposal",
      "sort": "2017-03-12",
      "date": "12 March 2017",
      "year": "2017",
      "short": "UASF: users propose an activation deadline",
      "title": "UASF: users propose an activation deadline",
      "category": "Forks & governance",
      "summary": "BIP 148 gives the SegWit debate a 1 August deadline.",
      "body": "The BIP 148 proposal describes a user-activated soft fork, or UASF. Participating nodes would reject blocks that failed to signal for SegWit during its enforcement window.",
      "why": "It makes the role of economically meaningful users and validating nodes central to the argument about activation.",
      "perspective": "The mechanism comes with a risk of incompatible chains if participants disagree. Later miner signaling through BIP 91 changes the situation before the deadline.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read BIP 148",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0148.mediawiki"
        }
      ]
    },
    {
      "id": "new-york-agreement",
      "sort": "2017-05-23",
      "date": "23 May 2017",
      "year": "2017",
      "short": "The New York Agreement proposes SegWit2x",
      "title": "The New York Agreement proposes SegWit2x",
      "category": "Forks & governance",
      "summary": "Companies and miners back SegWit followed by a block-size hard fork.",
      "body": "Signatories to the New York Agreement support SegWit activation and a later increase in the base block-size limit. The combined plan becomes known as SegWit2x.",
      "why": "The agreement tests whether coordination among prominent companies and miners can produce a rule change accepted across the network.",
      "perspective": "The signatories’ own announcement records their commitments. It does not establish unanimous agreement among developers, node operators or users.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the signatories’ announcement",
          "url": "https://dcgco.medium.com/bitcoin-scaling-agreement-at-consensus-2017-133521fe9a77"
        }
      ]
    },
    {
      "id": "bip91",
      "sort": "2017-07-01",
      "date": "July 2017",
      "year": "2017",
      "short": "BIP 91 coordinates miner signaling",
      "title": "BIP 91 coordinates miner signaling",
      "category": "Forks & governance",
      "summary": "A lower-threshold coordination mechanism helps move SegWit toward activation.",
      "body": "Miners deploy BIP 91, which requires SegWit signaling in accepted blocks after its own threshold is met. This happens before BIP 148’s 1 August enforcement date.",
      "why": "SegWit activation is a sequence of proposals, signaling and enforcement—not a single switch flipped by one group.",
      "perspective": "BIP 91, BIP 148 and SegWit are related but distinct. Assigning the whole outcome to one faction oversimplifies a contested history.",
      "kind": "layers",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read BIP 91",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0091.mediawiki"
        }
      ]
    },
    {
      "id": "uasf",
      "sort": "2017-08-01",
      "date": "1 August 2017",
      "year": "2017",
      "short": "The UASF enforcement window begins",
      "title": "The UASF enforcement window begins",
      "category": "Forks & governance",
      "summary": "The date becomes a lasting symbol of user participation in Bitcoin’s rules.",
      "body": "BIP 148’s enforcement window begins. Miner signaling coordinated through BIP 91 is already in place, helping avert the incompatible non-signaling chain that UASF supporters had prepared to reject.",
      "why": "The episode helps define a central Bitcoin question: miners create blocks, but validating users also choose which rules to accept.",
      "perspective": "This is not the day SegWit activates. Its actual activation follows on 24 August. Bitcoin Cash’s separate split on 1 August is another distinct event.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the enforcement specification",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0148.mediawiki"
        }
      ]
    },
    {
      "id": "bitcoin-cash",
      "sort": "2017-08-01",
      "date": "1 August 2017",
      "year": "2017",
      "short": "Bitcoin Cash splits from Bitcoin",
      "title": "Bitcoin Cash splits from Bitcoin",
      "category": "Forks & governance",
      "summary": "Two ledgers share an earlier history, then follow incompatible rules.",
      "body": "Bitcoin Cash diverges from Bitcoin after their last common block, 478,558. Its larger-block approach creates a separate chain and asset, BCH, while BTC continues on the Bitcoin chain.",
      "why": "The block-size conflict produces a lasting chain split. A shared past does not make two networks the same asset after their rules diverge.",
      "perspective": "This hard fork is different from SegWit’s soft fork and from a code-only fork such as Litecoin. Later BCH descendants, including BSV and the branch later called eCash, have their own splits.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the IRS’s factual account of the split",
          "url": "https://www.irs.gov/pub/irs-wd/202114020.pdf"
        }
      ]
    },
    {
      "id": "segwit",
      "date": "24 August 2017 · UTC",
      "year": "2017",
      "short": "SegWit activates",
      "title": "The transaction format evolves.",
      "body": "Segregated Witness, or SegWit, activates at block 481,824. It changes how signature data is recorded and counted, and fixes a form of transaction malleability: the ability to change a transaction’s identifier without changing its effect.",
      "why": "The upgrade increases effective capacity and helps make payment-channel systems such as Lightning more practical.",
      "perspective": "This is a compatible rule change, called a soft fork. It does not make fees disappear or give the base network unlimited capacity.",
      "kind": "layers",
      "stat": "481,824",
      "unit": "the block where SegWit activates.",
      "sources": [
        {
          "label": "Read the specification · BIP 141",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki"
        },
        {
          "label": "Explore block 481,824",
          "url": "https://mempool.space/block/481824"
        }
      ],
      "sort": "2017-08-24",
      "category": "Protocol",
      "summary": "A new transaction format activates at block 481,824."
    },
    {
      "id": "china-exchanges",
      "sort": "2017-09-01",
      "date": "September 2017",
      "year": "2017",
      "short": "China moves against domestic exchanges",
      "title": "China moves against domestic exchanges",
      "category": "Policy",
      "summary": "Local exchange operations face closure as the policy crackdown broadens.",
      "body": "China moves to shut domestic cryptocurrency exchanges in 2017. The restriction changes access to local trading services and pushes activity toward different markets and structures.",
      "why": "Bitcoin remains global even when a large national market restricts the businesses around it.",
      "perspective": "An exchange shutdown and a mining shutdown are different interventions. China’s large mining crackdown comes in 2021.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the U.S.–China Commission’s record",
          "url": "https://www.uscc.gov/sites/default/files/2021-07/July_2021_Trade_Bulletin.pdf"
        }
      ]
    },
    {
      "id": "bitcoin-gold",
      "sort": "2017-10-24",
      "date": "24 October 2017",
      "year": "2017",
      "short": "Bitcoin Gold creates another chain",
      "title": "Bitcoin Gold creates another chain",
      "category": "Forks & governance",
      "summary": "A mining-focused fork diverges after Bitcoin block 491,406.",
      "body": "Bitcoin Gold forks from Bitcoin’s history, introducing a different mining algorithm intended to make mining accessible to different hardware. The project’s launch includes a premine endowment.",
      "why": "Not every fork is about transaction capacity. Mining hardware, distribution and development incentives can also motivate competing networks.",
      "perspective": "BTG is a separate asset, not an upgrade that Bitcoin holders must install. The shared-history cutoff and the later public network launch are different dates.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the project’s own fork account",
          "url": "https://www.bitcoingold.org/the-bitcoin-gold-premine-endowment/"
        }
      ]
    },
    {
      "id": "segwit2x-cancelled",
      "sort": "2017-11-08",
      "date": "8 November 2017",
      "year": "2017",
      "short": "The SegWit2x hard fork is suspended",
      "title": "The SegWit2x hard fork is suspended",
      "category": "Forks & governance",
      "summary": "The proposed block-size increase fails to gain enough consensus.",
      "body": "Organizers suspend the planned SegWit2x hard fork shortly before its intended activation. SegWit itself has already activated; the additional block-size change does not become Bitcoin’s rule.",
      "why": "An agreement among influential businesses does not by itself change the rules followed by the wider network.",
      "perspective": "Cancellation of this particular proposal does not end disagreements over capacity, fees or governance. It should not be confused with the Bitcoin Cash split that already happened.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the archived cancellation announcement",
          "url": "https://web.archive.org/web/20171108202305/https://lists.linuxfoundation.org/pipermail/bitcoin-segwit2x/2017-November/000685.html"
        }
      ]
    },
    {
      "id": "futures",
      "sort": "2017-12-17",
      "date": "17–18 December 2017",
      "year": "2017",
      "short": "Bitcoin futures reach CME",
      "title": "Bitcoin futures reach CME",
      "category": "Markets",
      "summary": "A regulated derivatives venue adds Bitcoin price exposure.",
      "body": "Following Cboe’s launch a week earlier, CME opens cash-settled Bitcoin futures for the 18 December trade date, with trading beginning the prior evening.",
      "why": "Institutional investors gain a regulated instrument for hedging or taking Bitcoin price exposure without directly transferring bitcoin.",
      "perspective": "A futures contract is not a spot ETF or direct ownership of BTC. Leverage, expiry and settlement introduce different risks.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read CME’s original filing",
          "url": "https://www.cmegroup.com/market-regulation/rule-filings/2017/12/17-417.pdf"
        }
      ]
    },
    {
      "id": "lightning",
      "date": "15 March 2018",
      "year": "2018",
      "short": "Lightning’s next step",
      "title": "Payments get another layer.",
      "body": "Lightning Labs releases lnd 0.4-beta for Bitcoin mainnet. It is a major early milestone for Lightning, a network of payment channels built on top of Bitcoin.",
      "why": "People can make repeated payments through channels without putting every individual payment directly on the blockchain.",
      "perspective": "Lightning has liquidity, routing and operational trade-offs. This release was a beta, not the invention of the entire Lightning concept or a claim that development was complete.",
      "kind": "lightning",
      "stat": "A second layer",
      "unit": "smaller payments, a different set of trade-offs.",
      "sources": [
        {
          "label": "Read the original lnd beta announcement",
          "url": "https://blog.lightning.engineering/announcement/2018/03/15/lnd-beta.html"
        }
      ],
      "sort": "2018-03-15",
      "category": "Technology",
      "summary": "The lnd mainnet beta brings payment channels closer to everyday use."
    },
    {
      "id": "2018-inflation-bug",
      "sort": "2018-09-18",
      "date": "18–20 September 2018",
      "year": "2018",
      "short": "A serious vulnerability is patched",
      "title": "A serious vulnerability is patched",
      "category": "Security",
      "summary": "Bitcoin Core fixes a denial-of-service and inflation vulnerability.",
      "body": "Bitcoin Core releases fixes for CVE-2018-17144 on 18 September and publishes the full inflation-risk disclosure on 20 September. Developers coordinate upgrades while limiting early exposure of the most serious details.",
      "why": "Independent review, responsible disclosure and software maintenance remain essential to the system’s security.",
      "perspective": "At disclosure, developers reported no known exploitation. A vulnerability’s existence is different from evidence that extra coins entered the accepted chain.",
      "kind": "custody",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Bitcoin Core’s disclosure",
          "url": "https://bitcoincore.org/en/2018/09/20/notice/"
        }
      ]
    },
    {
      "id": "bitcoin-sv",
      "sort": "2018-11-15",
      "date": "15 November 2018",
      "year": "2018",
      "short": "Bitcoin SV branches from Bitcoin Cash",
      "title": "Bitcoin SV branches from Bitcoin Cash",
      "category": "Forks & governance",
      "summary": "BCH itself splits, creating the separate BSV chain.",
      "body": "A disagreement within Bitcoin Cash produces competing BCH and Bitcoin SV networks. BSV branches from BCH’s history rather than representing a new direct upgrade to BTC.",
      "why": "The family tree now has branches of branches. Names and a common ancestry can obscure important differences in rules and governance.",
      "perspective": "BTC, BCH and BSV are separate networks. The existence of one does not imply endorsement or control by the others.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the issuer’s contemporaneous fork record",
          "url": "https://www.sec.gov/comments/sr-nysearca-2019-01/srnysearca201901-5164833-183434.pdf"
        }
      ]
    },
    {
      "id": "taproot-proposal",
      "sort": "2019-05-06",
      "date": "6 May 2019",
      "year": "2019",
      "short": "Taproot moves into public review",
      "title": "Taproot moves into public review",
      "category": "Protocol",
      "summary": "A proposal begins a long path from discussion to activation.",
      "body": "Pieter Wuille shares a Taproot proposal for discussion. The design combines Schnorr signatures and new script structures to improve the efficiency and privacy of some spending arrangements.",
      "why": "Major changes can take years of public scrutiny, implementation and activation work.",
      "perspective": "A proposal does not immediately alter anyone’s coins or rules. Taproot’s activation comes in November 2021.",
      "kind": "tree",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read BIP 341’s proposal history",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki"
        }
      ]
    },
    {
      "id": "third-halving",
      "sort": "2020-05-11",
      "date": "11 May 2020 · UTC",
      "year": "2020",
      "short": "The third halving",
      "title": "The third halving",
      "category": "Monetary policy",
      "summary": "The subsidy falls from 12.5 to 6.25 BTC at block 630,000.",
      "body": "Bitcoin reaches its third subsidy halving as the network continues through another four-year issuance era.",
      "why": "The same block-based monetary schedule persists while the world around the network changes.",
      "perspective": "The event changes new issuance, not the existing balances of holders. Its price effects cannot be isolated from demand and wider economic conditions.",
      "kind": "halving",
      "stat": "12.5 → 6.25",
      "unit": "BTC subsidy per block",
      "sources": [
        {
          "label": "Explore block 630,000",
          "url": "https://mempool.space/block/630000"
        }
      ]
    },
    {
      "id": "microstrategy",
      "sort": "2020-08-11",
      "date": "11 August 2020",
      "year": "2020",
      "short": "Bitcoin enters a public-company treasury",
      "title": "Bitcoin enters a public-company treasury",
      "category": "Adoption",
      "summary": "MicroStrategy announces Bitcoin as its primary treasury reserve asset.",
      "body": "MicroStrategy announces the purchase of 21,454 BTC for approximately $250 million and adopts Bitcoin as its primary treasury reserve asset.",
      "why": "The decision brings corporate balance-sheet strategy into Bitcoin’s adoption story.",
      "perspective": "This is one company’s allocation decision, not proof that Bitcoin is suitable for every company or household. Concentration and financing choices matter.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the company’s original release",
          "url": "https://www.nasdaq.com/press-release/microstrategy-adopts-bitcoin-as-primary-treasury-reserve-asset-2020-08-11"
        }
      ]
    },
    {
      "id": "paypal",
      "sort": "2020-10-21",
      "date": "21 October 2020",
      "year": "2020",
      "short": "PayPal announces Bitcoin access",
      "title": "PayPal announces Bitcoin access",
      "category": "Adoption",
      "summary": "A familiar payments app adds buying, holding and selling of selected cryptocurrencies.",
      "body": "PayPal announces a new cryptocurrency service, initially for U.S. users, supporting Bitcoin and several other assets within its wallet.",
      "why": "Access expands through an interface many people already know, reducing some onboarding friction.",
      "perspective": "The initial service is custodial. Buying within an app is not automatically the same as withdrawing to a wallet whose keys you control.",
      "kind": "transfer",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read PayPal’s announcement",
          "url": "https://newsroom.paypal-corp.com/2020-10-21-PayPal-Launches-New-Service-Enabling-Users-to-Buy-Hold-and-Sell-Cryptocurrency"
        }
      ]
    },
    {
      "id": "ecash-split",
      "sort": "2020-11-15",
      "date": "15 November 2020",
      "year": "2020",
      "short": "A further BCH split leads toward eCash",
      "title": "A further BCH split leads toward eCash",
      "category": "Forks & governance",
      "summary": "Bitcoin Cash Node and Bitcoin ABC follow separate chains.",
      "body": "Another Bitcoin Cash chain split separates BCH from the Bitcoin ABC branch, which is later rebranded as eCash. It extends the chain of descendants from the 2017 split.",
      "why": "Fork history is not simply BTC versus one alternative. Subsequent communities can also disagree and divide.",
      "perspective": "This is a split within the BCH family, not an activation on the BTC network. Later branding should not be mistaken for the original split date.",
      "kind": "fork",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Bitcoin ABC’s account of the split",
          "url": "https://www.bitcoinabc.org/2022-02-01-splitting-xec-and-bch/"
        }
      ]
    },
    {
      "id": "canada-spot-etf",
      "sort": "2021-02-18",
      "date": "18 February 2021",
      "year": "2021",
      "short": "A spot Bitcoin ETF begins trading in Canada",
      "title": "A spot Bitcoin ETF begins trading in Canada",
      "category": "Markets",
      "summary": "Purpose Bitcoin ETF launches on the Toronto Stock Exchange.",
      "body": "Purpose Bitcoin ETF begins trading on TSX. The fund invests directly in bitcoin, providing a different structure from the futures-based U.S. product that launches later that year.",
      "why": "The ETF story is international. U.S. spot-product approval in 2024 is not the first time this kind of access exists anywhere.",
      "perspective": "An ETF share remains a financial product with its own structure and fees. It is different from holding bitcoin directly in a wallet.",
      "kind": "block",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "url": "https://www.tmx.com/en/newsroom/press-releases?id=919&year=2021",
          "label": "Read the Toronto Stock Exchange’s launch announcement"
        }
      ]
    },
    {
      "id": "china-mining",
      "sort": "2021-06-01",
      "date": "May–June 2021",
      "year": "2021",
      "short": "China cracks down on Bitcoin mining",
      "title": "China cracks down on Bitcoin mining",
      "category": "Mining",
      "summary": "A major mining region goes offline, prompting a large geographic reshuffle.",
      "body": "China’s crackdown forces many mining operations to stop. Cambridge’s later analysis records a 38% fall in global network hashrate in June and signs of equipment moving overseas.",
      "why": "Bitcoin faces a real-world concentration shock: electricity, geography and government policy are part of mining security.",
      "perspective": "Hashrate estimates and geographic samples have limits. The crackdown disrupts block production but does not erase the chain or move users’ coins.",
      "kind": "block",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Cambridge’s mining research",
          "url": "https://www.jbs.cam.ac.uk/2021/geographic-shift/"
        }
      ]
    },
    {
      "id": "el-salvador",
      "sort": "2021-09-07",
      "date": "7 September 2021",
      "year": "2021",
      "short": "El Salvador adopts Bitcoin as legal tender",
      "title": "El Salvador adopts Bitcoin as legal tender",
      "category": "Policy",
      "summary": "A national Bitcoin law takes effect alongside the existing dollar system.",
      "body": "El Salvador becomes the first country to adopt Bitcoin as legal tender, with a government-backed wallet and a legal framework encouraging its use.",
      "why": "Bitcoin moves from private adoption into a national monetary-policy experiment.",
      "perspective": "Legal designation does not establish widespread everyday use. The framework is amended in 2025 to make private acceptance voluntary and tax payments dollar-only.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the IMF’s contemporary assessment",
          "url": "https://www.imf.org/en/news/articles/2021/11/22/mcs-el-salvador-staff-concluding-statement-of-the-2021-article-iv-mission"
        }
      ]
    },
    {
      "id": "mining-map",
      "sort": "2021-10-13",
      "date": "13 October 2021",
      "year": "2021",
      "short": "The mining map shifts",
      "title": "The mining map shifts",
      "category": "Mining",
      "summary": "Cambridge’s post-crackdown data places the U.S. first in its sampled geographic distribution.",
      "body": "Cambridge publishes data through August 2021 showing a larger U.S. share of mining and an initial rebound in global hashrate after China’s crackdown.",
      "why": "The episode demonstrates that mining equipment can relocate, while also raising fresh questions about concentration in new regions.",
      "perspective": "This is a historical data release, not today’s mining map. Pool location data can be affected by routing and proxy use.",
      "kind": "block",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the original Cambridge update",
          "url": "https://www.jbs.cam.ac.uk/2021/geographic-shift/"
        }
      ]
    },
    {
      "id": "futures-etf",
      "sort": "2021-10-19",
      "date": "19 October 2021",
      "year": "2021",
      "short": "The first U.S. Bitcoin futures ETF launches",
      "title": "The first U.S. Bitcoin futures ETF launches",
      "category": "Markets",
      "summary": "ProShares BITO offers exchange-traded exposure through futures.",
      "body": "ProShares launches BITO, an ETF investing primarily in Bitcoin futures. It makes that form of exposure available through ordinary securities accounts.",
      "why": "The path toward exchange-traded Bitcoin products has an important intermediate step before U.S. spot products arrive.",
      "perspective": "BITO does not directly hold bitcoin. Futures-based and spot-based products should not be described as the same thing.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read ProShares’ launch announcement",
          "url": "https://www.proshares.com/press-releases/proshares-to-launch-the-first-u.s.-bitcoin-linked-etf-on-october-19"
        }
      ]
    },
    {
      "id": "taproot",
      "date": "14 November 2021 · UTC",
      "year": "2021",
      "short": "Taproot activates",
      "title": "More can happen behind a simpler spend.",
      "body": "Taproot activates at block 709,632, bringing Schnorr signatures and new ways to express spending conditions to Bitcoin.",
      "why": "The upgrade allows some complex arrangements to look more like ordinary payments when spent cooperatively, improving efficiency and privacy in those cases.",
      "perspective": "Taproot does not make Bitcoin anonymous. The privacy benefit depends on how a transaction is constructed and spent.",
      "kind": "tree",
      "stat": "709,632",
      "unit": "the block where Taproot activates.",
      "sources": [
        {
          "label": "Read the specification · BIP 341",
          "url": "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki"
        },
        {
          "label": "Explore block 709,632",
          "url": "https://mempool.space/block/709632"
        }
      ],
      "sort": "2021-11-14",
      "category": "Protocol",
      "summary": "Schnorr signatures and new spending rules activate at block 709,632."
    },
    {
      "id": "ftx",
      "date": "11 November 2022",
      "year": "2022",
      "short": "FTX files for bankruptcy",
      "title": "The custody lesson returns.",
      "body": "FTX files for Chapter 11 bankruptcy as the exchange crisis unfolds. Customers discover that an account balance is not the same thing as being able to withdraw their assets.",
      "why": "The failure renews scrutiny of intermediaries, customer-asset handling and the risks hidden behind convenient interfaces.",
      "perspective": "FTX was a company, not the Bitcoin protocol. Its collapse still caused real harm and showed why the services around a technology deserve separate scrutiny.",
      "kind": "custody",
      "stat": "Access matters",
      "unit": "a balance on a screen is only part of the story.",
      "sources": [
        {
          "label": "Read the Federal Reserve Bank of Chicago’s analysis",
          "url": "https://www.chicagofed.org/publications/chicago-fed-letter/2023/479"
        },
        {
          "label": "Bankruptcy notice · Louisiana regulator",
          "url": "https://ofi.la.gov/ftx-files-chapter-11-bankruptcy/"
        }
      ],
      "sort": "2022-11-11",
      "category": "Security",
      "summary": "The exchange files for bankruptcy. Customer access and asset handling face renewed scrutiny."
    },
    {
      "id": "ordinals",
      "sort": "2023-01-01",
      "date": "January 2023",
      "year": "2023",
      "short": "Ordinals brings inscriptions to the debate",
      "title": "Ordinals brings inscriptions to the debate",
      "category": "Technology",
      "summary": "New uses of block space renew arguments about what Bitcoin should carry.",
      "body": "Ordinals software develops inscription functionality, enabling content to be associated with individual satoshis under its indexing convention. Interest brings new demand for block space and renewed debate over data, fees and node costs.",
      "why": "Bitcoin’s history includes competing views of useful activity, not just agreement over payments or savings.",
      "perspective": "Ordinals is an application convention, not a new Bitcoin consensus rule or proof that an inscription has lasting economic value.",
      "kind": "layers",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the project’s early release history",
          "url": "https://github.com/ordinals/ord/blob/master/CHANGELOG.md"
        }
      ]
    },
    {
      "id": "grayscale-court",
      "sort": "2023-08-29",
      "date": "29 August 2023",
      "year": "2023",
      "short": "Grayscale wins its court challenge",
      "title": "Grayscale wins its court challenge",
      "category": "Policy",
      "summary": "A court vacates the SEC’s rejection of a proposed spot Bitcoin product.",
      "body": "The D.C. Circuit grants Grayscale’s petition and vacates the SEC order denying its proposed conversion to a spot Bitcoin ETP. The court finds that the Commission did not adequately explain its different treatment of similar products.",
      "why": "The decision becomes a major step in the path toward U.S. spot Bitcoin ETP approval.",
      "perspective": "The ruling does not itself launch an ETF or endorse Bitcoin as an investment. Approval and trading occur later.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the court’s opinion",
          "url": "https://media.cadc.uscourts.gov/opinions/docs/2023/08/22-1142-2014527.pdf"
        }
      ]
    },
    {
      "id": "spot-etps",
      "date": "10 January 2024",
      "year": "2024",
      "short": "U.S. spot Bitcoin funds",
      "title": "A new route through the brokerage account.",
      "body": "The U.S. Securities and Exchange Commission approves exchange rule changes allowing spot Bitcoin exchange-traded product shares to be listed and traded.",
      "why": "These products give investors another route to Bitcoin price exposure through securities accounts, without personally managing Bitcoin keys.",
      "perspective": "The SEC approved the products’ listing and trading—not Bitcoin as an investment. Fund shares have fees and custody arrangements and are different from directly holding bitcoin.",
      "kind": "institution",
      "stat": "New access",
      "unit": "the asset and the wrapper are different.",
      "sources": [
        {
          "label": "Read the SEC’s approval statement",
          "url": "https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023"
        }
      ],
      "sort": "2024-01-10",
      "category": "Markets",
      "summary": "The SEC approves the listing and trading of U.S. spot Bitcoin ETPs."
    },
    {
      "id": "spot-etfs-launch",
      "sort": "2024-01-11",
      "date": "11 January 2024",
      "year": "2024",
      "short": "U.S. spot Bitcoin ETFs begin trading",
      "title": "U.S. spot Bitcoin ETFs begin trading",
      "category": "Markets",
      "summary": "After approval comes the actual market launch.",
      "body": "U.S. spot Bitcoin products begin trading following the SEC’s approval of exchange rule changes the previous day. BlackRock’s IBIT is among the newly launched products.",
      "why": "Brokerage-account access to spot Bitcoin price exposure becomes a reality rather than an application or court case.",
      "perspective": "Investors own product shares, not personally controlled Bitcoin keys. Fees, structure and custody arrangements remain relevant.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the issuer’s launch release",
          "url": "https://www.nasdaq.com/press-release/blackrocks-ibit-debuts-on-nasdaq-2024-01-11"
        }
      ]
    },
    {
      "id": "fourth-halving",
      "date": "20 April 2024 · UTC",
      "year": "2024",
      "short": "The fourth halving",
      "title": "The schedule continues.",
      "body": "At block 840,000, Bitcoin’s block subsidy falls from 6.25 BTC to 3.125 BTC. The same issuance mechanism seen in 2012 is still operating, now at a smaller scale.",
      "why": "The event is a visible reminder that Bitcoin’s monetary schedule is measured in blocks, not calendar dates.",
      "perspective": "Mining revenue also includes transaction fees. A predictable supply schedule does not make demand, price or mining economics predictable.",
      "kind": "halving",
      "stat": "6.25 → 3.125",
      "unit": "BTC subsidy per block.",
      "sources": [
        {
          "label": "Explore block 840,000",
          "url": "https://mempool.space/block/840000"
        },
        {
          "label": "Read the issuance rules",
          "url": "https://github.com/bitcoin/bitcoin/blob/master/src/validation.cpp"
        }
      ],
      "sort": "2024-04-20",
      "category": "Monetary policy",
      "summary": "The fourth halving reduces the subsidy to 3.125 BTC per block."
    },
    {
      "id": "el-salvador-reform",
      "sort": "2025-01-01",
      "date": "January 2025",
      "year": "2025",
      "short": "El Salvador changes its Bitcoin framework",
      "title": "El Salvador changes its Bitcoin framework",
      "category": "Policy",
      "summary": "Private acceptance becomes voluntary; taxes must be paid in U.S. dollars.",
      "body": "El Salvador reforms its Bitcoin law as part of an IMF-supported policy package. The IMF describes voluntary private-sector acceptance and tax payments only in dollars.",
      "why": "The national experiment evolves. A useful history records revisions as carefully as initial announcements.",
      "perspective": "This policy change should not be flattened into either “nothing changed” or a claim that every form of Bitcoin ownership was banned.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the IMF program report",
          "url": "https://www.elibrary.imf.org/abstract/journals/002/2025/058/article-A001-en.xml"
        }
      ]
    },
    {
      "id": "reserve",
      "date": "6 March 2025",
      "year": "2025",
      "short": "The U.S. reserve order",
      "title": "Bitcoin enters a different policy conversation.",
      "body": "A U.S. executive order establishes a Strategic Bitcoin Reserve, initially to be capitalized with bitcoin held by the government through final forfeiture, subject to the order’s conditions.",
      "why": "Bitcoin becomes the subject of an explicit national reserve policy, illustrating how far the conversation has moved since a small mailing-list announcement.",
      "perspective": "The order is not evidence of a completed open-market purchase. Policy can change, and government interest does not remove the risks of owning Bitcoin.",
      "kind": "institution",
      "stat": "A policy shift",
      "unit": "from an experiment to a reserve debate.",
      "sources": [
        {
          "label": "Read the executive order",
          "url": "https://www.whitehouse.gov/presidential-actions/2025/03/establishment-of-the-strategic-bitcoin-reserve-and-united-states-digital-asset-stockpile/"
        }
      ],
      "sort": "2025-03-06",
      "category": "Policy",
      "summary": "An executive order establishes a U.S. Strategic Bitcoin Reserve, initially using forfeited bitcoin."
    },
    {
      "id": "in-kind-etps",
      "sort": "2025-07-29",
      "date": "29 July 2025",
      "year": "2025",
      "short": "Spot products gain in-kind creation and redemption",
      "title": "Spot products gain in-kind creation and redemption",
      "category": "Markets",
      "summary": "The SEC permits a different operational mechanism for crypto ETPs.",
      "body": "The SEC permits in-kind creations and redemptions for Bitcoin and ether ETPs, allowing qualifying processes to exchange the underlying assets rather than use only cash.",
      "why": "The infrastructure around exchange-traded exposure continues to mature after the initial launches.",
      "perspective": "This concerns product operations and authorized participants. It does not mean every retail shareholder can redeem shares for bitcoin.",
      "kind": "institution",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the SEC’s announcement",
          "url": "https://www.sec.gov/newsroom/press-releases/2025-101-sec-permits-kind-creations-redemptions-crypto-etps"
        }
      ]
    },
    {
      "id": "core-30",
      "sort": "2025-10-10",
      "date": "10 October 2025",
      "year": "2025",
      "short": "Bitcoin Core 30.0 is released",
      "title": "Bitcoin Core 30.0 is released",
      "category": "Technology",
      "summary": "Relay and software policy continue to evolve separately from consensus.",
      "body": "Bitcoin Core releases version 30.0 with changes to the software, including transaction-relay policy. The release notes discuss data-carrier policy and other operational changes.",
      "why": "The distinction between which transactions a node relays and which blocks it considers valid remains part of the scaling and data debate.",
      "perspective": "An application’s policy defaults are not automatically new consensus rules. Operators choose their software and configuration.",
      "kind": "layers",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read Bitcoin Core’s announcement",
          "url": "https://bitcoincore.org/en/2025/10/10/release-30.0/"
        },
        {
          "url": "https://bitcoincore.org/en/releases/30.0/",
          "label": "Read the policy changes in the release notes"
        }
      ]
    },
    {
      "id": "core-31",
      "sort": "2026-04-19",
      "date": "19 April 2026",
      "year": "2026",
      "short": "Bitcoin Core 31.0 continues the work",
      "title": "Bitcoin Core 31.0 continues the work",
      "category": "Technology",
      "summary": "The software receives another major round of improvements.",
      "body": "Bitcoin Core releases version 31.0 with new features, performance improvements and fixes. Its notes document ongoing work on transaction handling, networking and node operation.",
      "why": "Bitcoin’s design may be deliberately conservative, but the software supporting it is not frozen in 2009.",
      "perspective": "A release number is not a compulsory network-wide upgrade or a separate currency. The individual changes and their compatibility matter.",
      "kind": "layers",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the release announcement",
          "url": "https://bitcoincore.org/en/2026/04/19/release-31.0/"
        }
      ]
    },
    {
      "id": "core-32-maintenance",
      "sort": "2026-10-27",
      "date": "27 October 2026",
      "year": "2026",
      "short": "Maintenance continues into the present",
      "title": "Maintenance continues into the present",
      "category": "Technology",
      "summary": "Bitcoin Core 32.1 is released with further fixes.",
      "body": "The Bitcoin Core project announces version 32.1. Alongside major protocol milestones, maintenance releases illustrate the continuing work of testing, review and fixing software.",
      "why": "The history reaches the present through people maintaining the network, not only through large market headlines.",
      "perspective": "This dated entry records a release, not a recommendation about which software a particular reader should run.",
      "kind": "layers",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Read the current-period release announcement",
          "url": "https://bitcoincore.org/en/2026/10/27/release-32.1/"
        }
      ]
    },
    {
      "id": "eighteen-years",
      "sort": "2026-10-31",
      "date": "31 October 2026",
      "year": "2026",
      "short": "Eighteen years after the white paper",
      "title": "Eighteen years after the white paper",
      "category": "Perspective",
      "summary": "The story is still being written.",
      "body": "Eighteen years separate Satoshi’s white-paper announcement from this timeline’s review date. The network itself began in January 2009, so the paper’s anniversary and the network’s age are different measures.",
      "why": "The long view includes inventions, disputes, failures, policy changes and practical lessons—not a straight line of inevitable success.",
      "perspective": "This is a reviewed selection of major developments through 31 October 2026, not a live news feed or an exhaustive catalog of every fork and software release.",
      "kind": "paper",
      "stat": "",
      "unit": "",
      "sources": [
        {
          "label": "Return to the original announcement",
          "url": "https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html"
        }
      ]
    }
  ]
};
