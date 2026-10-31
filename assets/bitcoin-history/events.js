/* Curated historical records. Dates marked UTC use block timestamps. */
window.BITCOIN_HISTORY = {
  "chapters": [
    [
      "An idea becomes real",
      "2008—2010",
      "A paper. A network. Two pizzas."
    ],
    [
      "Growing pains",
      "2012—2014",
      "Scarcity meets the real world."
    ],
    [
      "Building the rails",
      "2017—2018",
      "A network learns new tricks."
    ],
    [
      "A wider world",
      "2021—2025",
      "New access. Familiar responsibilities."
    ]
  ],
  "events": [
    {
      "id": "white-paper",
      "chapter": 0,
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
      ]
    },
    {
      "id": "genesis",
      "chapter": 0,
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
      ]
    },
    {
      "id": "hal-finney",
      "chapter": 0,
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
      ]
    },
    {
      "id": "pizza",
      "chapter": 0,
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
      ]
    },
    {
      "id": "first-halving",
      "chapter": 1,
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
      ]
    },
    {
      "id": "chain-split",
      "chapter": 1,
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
      ]
    },
    {
      "id": "mt-gox",
      "chapter": 1,
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
      ]
    },
    {
      "id": "segwit",
      "chapter": 2,
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
      ]
    },
    {
      "id": "lightning",
      "chapter": 2,
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
      ]
    },
    {
      "id": "taproot",
      "chapter": 3,
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
      ]
    },
    {
      "id": "ftx",
      "chapter": 3,
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
      ]
    },
    {
      "id": "spot-etps",
      "chapter": 3,
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
      ]
    },
    {
      "id": "fourth-halving",
      "chapter": 3,
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
      ]
    },
    {
      "id": "reserve",
      "chapter": 3,
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
      ]
    }
  ]
};
