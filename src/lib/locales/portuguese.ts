export default {
	commands: {
		about: {
			description: 'Mostra informações sobre o bot',
			versions: 'Versões',
			servers: 'Servidores',
			matchs: 'Partidas',
			creator: 'Criador',
			links: 'Links',
			tos: 'Termos de Serviço',
			pp: 'Políticas de Privacidade'
		},
		create: {
			description: 'Cria uma nova partida',
			join_match: 'Entrar na Partida',
			start_match: 'Começar Partida',
			cancel_match: 'Cancelar Partida',
			queue_description: 'Você acabou de criar uma partida, chame seus amigos para jogar junto com você!',
			players: 'Jogadores',
			messages: {
				started: 'Partida Iniciada',
				joined: 'Você entrou na partida',
				cancelled_by_inactivity: 'A partida foi cancelada por inatividade',
				cancelled_by_host: 'A partida foi cancelada pelo criador'
			},
			maintenance: 'O bot está em manutenção, tente novamente mais tarde'
		},
		draw: {
			description: 'Use para comprar cartas',
			drew_card: 'O Jogador {0} comprou 1 carta e passou a vez'
		},
		help: {
			description: 'Como usar os comandos',
			create: {
				title: 'Como iniciar uma partida?',
				description:
					'Para criar uma partida, utilize o comando ` create `, os demais entrarão clicando no botão que aparecer no canal e a partida iniciará após clicar no botão de iniciar partida'
			},
			play: {
				title: 'Como ver minhas cartas ou fazer uma jogada?',
				description:
					'Quando sua vez chegar, utilize o comando ` play `, você verá todas as suas cartas e poderá pesquisá-las para fazer sua jogada, caso a carta que você tenha selecionado não se encaixar com a carta na mesa, ou a carta pesquisada não estiver na sua mão, uma mensagem de erro aparecerá'
			},
			draw: {
				title: 'Como faço para comprar cartas?',
				description:
					'Caso nenhuma de suas cartas combinar com a carta da mesa, você pode comprar uma carta nova e passar a vez usando o comando ` draw `'
			},
			leave: {
				title: 'Como faço pra sair da partida?',
				description:
					'Se precisar sair da partida, você pode utilizar o comando ` leave ` e sair da partida normalmente, porém perderá todo o seu progresso e não poderá retornar para a partida'
			}
		},
		leave: {
			description: 'Use para sair de alguma partida',
			user_left: '{0} saiu da partida'
		},
		ping: {
			description: 'Verifica a latência do bot',
			latency: 'Latência'
		},
		play: {
			description: 'Faça uma jogada',
			options: {
				cards: {
					description: 'A carta que será jogada'
				},
				uno: {
					description: 'Diga UNO! para jogar a sua penúltima carta!'
				}
			},
			draw_card_option: 'Comprar uma carta',
			messages: {
				played: {
					last_card: 'O jogador {0} ficou sem cartas e venceu a partida',
					'4wild': '{0} jogou uma carta especial +4 e alterou a cor da jogada\n{1} recebeu +4 cartas e agora tem ` {2} ` cartas',
					wild: '{0} jogou uma carta especial e alterou a cor da jogada',
					'+2': '{0} jogou uma carta +2\n{1} recebeu +2 cartas e agora tem ` {2} ` cartas',
					reverse: '{0} jogou uma carta reverso, invertendo a sequência de jogadores',
					block: '{0} jogou uma carta bloqueio e bloqueou {1} de jogar'
				},
				'stacked+2': '{0} jogou uma carta +2, o acúmulo de compras de cartas está em {1} cartas',
				finished_stacking:
					'{0} jogou uma carta +2. O jogador {1} não tem cartas +2 e comprou {3} cartas, agora o jogador {1} tem ` {2} ` cartas',
				uno: '<:uno:1002561065399373944> {0} está só com ` 1 ` carta restante!',
				report: 'O jogador esqueceu de dizer `UNO!`, corra e reporte para puni-lo!'
			}
		},
		vote: {
			description: 'Dê o seu suporte ao nosso bot <3',
			embed: {
				description: 'Qualquer gesto já ajuda o nosso bot a crescer cada vez mais. Vote abaixo clicando nos botões para ser redirecionado'
			}
		},
		invite: {
			description: 'Use esse comando para me convidar',
			embed: {
				description:
					'<:link:1016255696607657984> Clique no botão para me convitar para o seu servidor ou copie o link abaixo\n\n<:dot:1016255579553017986> [Convite]({0})'
			},
			button: {
				label: 'Me convide'
			}
		}
	},
	game: {
		cards: {
			block: 'Bloqueio',
			reverse: 'Reverso',
			any: 'Qualquer',
			red: 'Vermelho',
			blue: 'Azul',
			green: 'Verde',
			yellow: 'Amarelo',
			wild: 'Coringa',
			cards: 'Cartas'
		},
		punished_by_inactivity:
			'O jogador {0} demorou muito para jogar e a sua vez foi passada.\n{0} recebeu +{2} cartas. Agora {0} tem ` {1} ` cartas',
		report: 'Reportar',
		embeds: {
			resume: {
				description: 'Agora é a vez de {0}\nÚltima carta jogada: ` {1} `',
				footer: 'Use /play para fazer a sua jogada, ou use /draw para comprar uma carta'
			},
			end: {
				descriptions: {
					inactivity: 'Todos os jogadores ficaram inativos. A partida foi encerrada',
					no_more_players: 'A partida acabou. Parabéns ao vencedor {0} !!\nRanking de vencedores:'
				},
				footer: 'Ajude o nosso bot usando o comando /vote <3'
			},
			cards: {
				footer: '{0} cartas restantes'
			}
		},
		punished_by_report: 'O jogador {0} esqueceu de dizer ` Uno! ` e ganhou +2 cartas',
		choose_color: 'Escolha a cor que deseja continuar',
		new_match_host: '{0} é o novo dono da partida',
		removed_by_inactivity: '{0} foi removido da partida por inatividade'
	},
	player: {
		messages: {
			played_last_card: '{0} jogou a sua última carta `{1}`'
		}
	},
	errors: {
		missing_permissions: 'Preciso das permissões ` {0} ` para funcionar corretamente',
		command_spam: 'Você está usando os comandos muito de pressa! Espere mais ` {0} ` segundos',
		command_on_dm: 'Meus comandos não foram feitos para serem executados na DM',
		unknown_command: 'Ocorreu um erro ao tentar executar o comando',
		abandoned_match: 'A partida criada foi abandonada pelo criador',
		cant_interact: 'Não consigo interagir com o canal',
		invalid_channel: 'Canal Inválido',
		existing_match: 'Já existe uma partida em andamento no canal',
		missing_host_permissions: 'Apenas quem criou a partida pode começá-la ou cancelá-la',
		insufficient_players: 'Não há jogadores o suficiente para começar uma partida',
		already_participating: 'Você já entrou na partida',
		no_matchs_found: 'Nenhuma partida encontrada no canal',
		match_not_started_yet: 'A partida ainda não começou',
		not_participating: 'Você não está participando dessa partida',
		not_your_turn: 'Ainda não é a sua vez de jogar',
		card_not_found: 'Não encontrei essa carda no meio do seu Deck, tem certeza de que digitou corretamente?',
		invalid_card: 'Essa carta não pode ser jogada',
		'only_+2_card': 'Apenas cartas +2 são válidas para essa jogada',
		generic: 'Ocorreu um erro ao executar o comando: `{0}`',
		owner_only: 'Esse comando não está disponível'
	},
	buttons: {
		view_cards: 'Ver Cartas',
		draw: 'Comprar Carta'
	},
	select_menus: {
		select_your_card: 'Selecione uma Carta',
		draw: {
			label: 'Compre uma Carta',
			description: 'Você não tem nenhuma carta jogável'
		}
	}
};
