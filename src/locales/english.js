export default {
  commands: {
    about: {
      description: "Shows information about the bot",
      versions: "Versions",
      servers: "Servers",
      matchs: "Matchs",
      creator: "Creator",
      links: "Links",
      tos: "Terms of Service",
      pp: "Privacy Policies",
    },
    create: {
      description: "Creates a new match",
      join_match: "Join match",
      start_match: "Start match",
      cancel_match: "Cancel match",
      queue_description:
        "You just created a match, call your friends to play with you!",
      players: "Players",
      messages: {
        started: "Starting",
        joined: "You joined the match",
        cancelled_by_inactivity: "The match was canceled by inactivity",
        cancelled_by_host: "The match was canceled by host",
      },
    },
    draw: {
      description: "Use to draw cards",
      drew_card: "{0} drew 1 card and passed the turn",
    },
    help: {
      description: "How to use the commands",
      create: {
        title: "How to start a match?",
        description:
          "To create a match, use the ` create ` command, the others will join by clicking the button that appears on the mesage and the match will start after clicking the start button",
      },
      play: {
        title: "How to see my cards or make a move?",
        description:
          "When its your turn, use the ` play ` command, you will see all your cards and you can search them to play, if the card you have selected do not fit the card on the table, or the searched card is not in your hand, an error message will appear",
      },
      draw: {
        title: "How do I draw cards?",
        description:
          "If none of your cards match the table card, you can buy a new card and pass your turn using the `draw` command",
      },
      leave: {
        title: "How do I leave the match?",
        description:
          "If you need to leave the match, you can use the ` leave ` command and leave the match normally, but you will lose all your progress and you will not be able to return to the match",
      },
    },
    leave: {
      description: "Use to leave some match",
      user_left: "{0} left the match",
    },
    ping: {
      description: "Check Bot latency",
      latency: "Latency",
    },
    play: {
      description: "Make a move",
      options: {
        cards: {
          description: "The card that will be played",
        },
        uno: {
          description: "Say UNO! To play your penultimate card!",
        },
      },
      draw_card_option: "Draw card",
      messages: {
        played: {
          last_card: "The player {0} ran out of cards and won the match",
          "4wild":
            "{0} played a wild +4 and changed the color of the match\n{1} received +4 cards and now has `{2}` cards",
          wild: "{0} played a wild and changed the color of the match",
          "+2": "{0} played a +2 card \n{1} received +2 cards and now has `{2}` cards",
          reverse:
            "{0} played a reverse card, reversing the sequence of players",
          block: "{0} played a block card and blocked {1} to play",
        },
        "stacked+2":
          "{0} played a +2 card, the accumulation of +2 cards is at {1}",
        finished_stacking:
          "{0} played a +2 card. The player {1} does not have more +2 and drew {3} cards, now the player {1} has `{2}` cards",
        uno: "<:uno:1002561065399373944> {0} is with only `1` remaining card!",
        report: "The player forgot to say `UNO!`, report to punish him!",
      },
    },
    vote: {
      description: "Give your support to our bot <3",
      embed: {
        description:
          "It helps our bot grow more and more. Vote below by clicking the buttons to be redirected",
      },
    },
    invite: {
      description: "Use this command to invite me",
      embed: {
        description:
          "<:link:1016255696607657984> Click the button to invite me to your server or copy the link below\n\n<:dot:1016255579553017986> [Invite]({0})",
      },
      button: {
        label: "Invite Me",
      },
    },
  },
  game: {
    cards: {
      block: "Block",
      reverse: "Reverse",
      any: "Any",
      red: "Red",
      blue: "Blue",
      green: "Green",
      yellow: "Yellow",
      wild: "Wild",
      cards: "Cards",
    },
    punished_by_inactivity:
      "{0} took a long time to play and your turn was passed.\n{0} received +{2} cards. Now {0} has ` {1} ` Letters",
    report: "Report",
    embeds: {
      resume: {
        description: "Now its {0} turn\nLast card: ` {1} `",
        footer: "Use /play to make your play, or use /draw to draw cards",
      },
      end: {
        descriptions: {
          inactivity: "All players were inactive. The match has been finished",
          no_more_players:
            "The match is over. Congratulations to the winner {0} !!  Ranking of winners:",
        },
        footer: "Help our bot using /vote <3",
      },
    },
    punished_by_report: "{0} forgot to say ` UNO! ` and received +2 cards",
    choose_color: "Choose the color you want to continue",
    new_match_host: "{0} is the new match host",
    removed_by_inactivity: "{0} was removed from the match by inactivity",
  },
  player: {
    messages: {
      played_last_card: "{0} played your last card `{1}`",
    },
  },
  errors: {
    missing_permissions:
      "I need these permissions: `Embed Links, See Channel and Send Message` to work correctly",
    command_spam:
      "You are using the commands very fast! Wait more `{0}` seconds",
    command_on_dm: "My commands were not made to be executed at DM",
    unknown_command: "An error occurred when trying to execute the command",
    abandoned_match: "The match created was abandoned by the host",
    cant_interact: "I can't interact with the channel",
    invalid_channel: "Invalid Channel",
    existing_match: "There is already a match on the channel",
    missing_host_permissions:
      "Only those who created the match can start or cancel it",
    insufficient_players: "There are no players enough to start a match",
    already_participating: "You have already joined the match",
    no_matchs_found: "No match found on the channel",
    match_not_started_yet: "The match has not yet started",
    not_participating: "You are not participating in this match",
    not_your_turn: "It's not yet your turn to play",
    card_not_found:
      "I didn't find this card in your deck, are you sure you spelled correctly?",
    invalid_card: "This card cannot be played",
    "only_+2_card": "Only +2 cards are valid for this play",
  },
};
