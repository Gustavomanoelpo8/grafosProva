    /**
     * CLASSE GRAFO
     * Representa a estrutura de dados do grafo com operações básicas
     * 
     * Funcionalidades:
     * - Armazenamento de vértices e arestas
     * - Representação matricial (adjacência e pesos)
     * - Operações de adição e manipulação
     */
    class Grafo {
      constructor() {
        // Tamanho máximo do grafo
        this.ordem = 50;
        
        // Matriz de adjacência (binária)
        this.matriz = Array.from({ length: this.ordem }, () => 
          Array(this.ordem).fill(0)
        );
        
        // Matriz de pesos das arestas
        this.pesos = Array.from({ length: this.ordem }, () => 
          Array(this.ordem).fill(0)
        );
        
        // Lista de nomes dos vértices
        this.nomes = [];
        
        // Coordenadas dos vértices para renderização
        this.coordenadas = [];
      }

      /**
       * Adiciona um novo vértice ao grafo
       * @param {string} nome - Identificador único do vértice
       * @param {number} x - Coordenada X no canvas
       * @param {number} y - Coordenada Y no canvas
       * @returns {boolean} - Sucesso da operação
       */
      adicionarVertice(nome, x, y) {
        // Validação de entrada
        if (!nome || this.nomes.includes(nome) || this.nomes.length >= this.ordem) {
          alert("Nome inválido, duplicado ou limite excedido!");
          return false;
        }
        
        // Adiciona ao registro
        this.nomes.push(nome);
        this.coordenadas.push({ x, y });
        return true;
      }

      /**
       * Adiciona uma aresta entre dois vértices
       * @param {string} origem - Vértice de origem
       * @param {string} destino - Vértice de destino
       * @param {number} peso - Peso da aresta (default=1)
       */
      AdicionarAresta(origem, destino, peso = 1) {
        const i_origem = this.nomes.indexOf(origem);
        const i_destino = this.nomes.indexOf(destino);

        // Valida índices e evita auto-conexões
        if (i_origem === -1 || i_destino === -1 || i_origem === i_destino) return;

        // Grafo não-direcionado (matriz simétrica)
        this.matriz[i_origem][i_destino] = peso;
        this.matriz[i_destino][i_origem] = peso;
        this.pesos[i_origem][i_destino] = peso;
        this.pesos[i_destino][i_origem] = peso;
      }

      /**
       * Gera representação visual da matriz de adjacência
       */
      gerarMatrizAdjacencia() {
        const matrizDiv = document.getElementById("matriz-output");
        
        // Cabeçalho da tabela
        let tabela = `<h3>Matriz de Adjacência</h3>
        <table border="1" cellpadding="5" cellspacing="0" 
               style="border-collapse: collapse; text-align: center; margin: 0 auto;">
          <tr><th></th>`;
        
        // Cabeçalho com nomes dos vértices
        this.nomes.forEach(nome => {
          tabela += `<th>${nome}</th>`;
        });
        tabela += "</tr>";
        
        // Linhas da matriz
        for (let i = 0; i < this.nomes.length; i++) {
          tabela += `<tr><th>${this.nomes[i]}</th>`;
          for (let j = 0; j < this.nomes.length; j++) {
            tabela += `<td>${this.matriz[i][j] || 0}</td>`;
          }
          tabela += "</tr>";
        }
        
        tabela += "</table>";
        matrizDiv.innerHTML = tabela;
      }

      /**
       * Encontra todos os caminhos entre dois vértices usando DFS
       * @param {string} origem - Vértice inicial
       * @param {string} destino - Vértice final
       * @returns {string[][]} - Lista de caminhos
       */
      encontrarTodosCaminhos(origem, destino) {
        const caminhos = [];
        const visitado = Array(this.nomes.length).fill(false);
        const caminhoAtual = [];
        
        // DFS recursivo
        const dfs = (atual) => {
          const i_atual = this.nomes.indexOf(atual);
          visitado[i_atual] = true;
          caminhoAtual.push(atual);
          
          // Chegou ao destino: registra caminho
          if (atual === destino) {
            caminhos.push([...caminhoAtual]);
          } 
          // Continua busca nos vizinhos
          else {
            for (let i = 0; i < this.nomes.length; i++) {
              if (this.matriz[i_atual][i] !== 0 && !visitado[i]) {
                dfs(this.nomes[i]);
              }
            }
          }
          
          // Backtracking
          caminhoAtual.pop();
          visitado[i_atual] = false;
        };
        
        dfs(origem);
        return caminhos;
      }

      /**
       * Cria grafo a partir de definição estruturada
       * @param {Object[]} dados - Lista de vértices e conexões
       */
      criarGrafoManual(dados) {
        // Coleta todos os vértices únicos
        const nomesUnicos = [
          ...new Set(dados.flatMap(d => [d.nome, ...d.arestas]))
        ];
        
        // Reinicializa estruturas
        this.nomes = nomesUnicos;
        this.coordenadas = [];
        this.matriz = Array.from({ length: this.ordem }, () => 
          Array(this.ordem).fill(0)
        );
        this.pesos = Array.from({ length: this.ordem }, () => 
          Array(this.ordem).fill(0)
        );
        
        // Posiciona vértices em círculo
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const raio = 180;
        
        nomesUnicos.forEach((nome, i) => {
          const angulo = (2 * Math.PI * i) / nomesUnicos.length;
          this.coordenadas.push({
            x: centroX + raio * Math.cos(angulo),
            y: centroY + raio * Math.sin(angulo)
          });
        });
        
        // Adiciona arestas
        dados.forEach(vertice => {
          const origemIndex = this.nomes.indexOf(vertice.nome);
          vertice.arestas.forEach(destinoNome => {
            const destinoIndex = this.nomes.indexOf(destinoNome);
            if (origemIndex !== -1 && destinoIndex !== -1) {
              this.AdicionarAresta(
                this.nomes[origemIndex],
                this.nomes[destinoIndex]
              );
            }
          });
        });
      }
    }

    // Inicialização do canvas e contexto gráfico
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    
    // Instância principal do grafo
    const grafo = new Grafo();
    
    // Variáveis para armazenamento de caminhos
    let caminhoMaisCurto = null;
    let caminhoMaisLongo = null;

    /**
     * Renderiza um vértice na tela
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @param {string} nome - Rótulo do vértice
     */
    function desenharVertice(x, y, nome) {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#e3f2fd";
      ctx.fill();
      ctx.strokeStyle = "#1e88e5";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Texto centralizado
      ctx.fillStyle = "#0d47a1";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(nome, x, y);
    }

    /**
     * Redesenha todo o grafo na tela
     * - Limpa canvas
     * - Desenha arestas
     * - Desenha vértices
     * - Destaca caminhos especiais (se existirem)
     */
    function redesenharTudo() {
      // Limpeza do canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenho das arestas
      for (let i = 0; i < grafo.nomes.length; i++) {
        for (let j = i + 1; j < grafo.nomes.length; j++) {
          if (grafo.matriz[i][j] !== 0) {
            const p1 = grafo.coordenadas[i];
            const p2 = grafo.coordenadas[j];
            
            // Linha principal
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = "#90a4ae";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Peso da aresta
            ctx.fillStyle = "#e65100";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
              grafo.pesos[i][j],
              (p1.x + p2.x) / 2,
              (p1.y + p2.y) / 2
            );
          }
        }
      }
      
      // Desenho dos vértices
      for (let i = 0; i < grafo.nomes.length; i++) {
        const v = grafo.coordenadas[i];
        desenharVertice(v.x, v.y, grafo.nomes[i]);
      }
      
      /**
       * Destaca um caminho específico
       * @param {string[]} caminho - Sequência de vértices
       * @param {string} cor - Código de cor CSS
       */
      const destacarCaminho = (caminho, cor) => {
        ctx.strokeStyle = cor;
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        
        for (let i = 0; i < caminho.length - 1; i++) {
          const idx1 = grafo.nomes.indexOf(caminho[i]);
          const idx2 = grafo.nomes.indexOf(caminho[i + 1]);
          const p1 = grafo.coordenadas[idx1];
          const p2 = grafo.coordenadas[idx2];
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      };
      
      // Destaca caminhos especiais
      if (caminhoMaisCurto) destacarCaminho(caminhoMaisCurto, "#1e88e5");
      if (caminhoMaisLongo) destacarCaminho(caminhoMaisLongo, "#e53935");
    }

    // Estado de seleção para criação de arestas
    let verticeSelecionado = null;

    // Evento de clique no canvas
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const raio = 20;
      
      // Verifica clique em vértice existente
      let verticeClicado = null;
      for (let i = 0; i < grafo.coordenadas.length; i++) {
        const v = grafo.coordenadas[i];
        const distancia = Math.sqrt((x - v.x) ** 2 + (y - v.y) ** 2);
        if (distancia <= raio) {
          verticeClicado = i;
          break;
        }
      }
      
      // Comportamentos:
      if (verticeClicado !== null) {
        // Modo de criação de aresta
        if (verticeSelecionado !== null) {
          if (verticeSelecionado !== verticeClicado) {
            const peso = parseFloat(prompt("Peso da aresta:", "1"));
            if (!isNaN(peso) && peso > 0) {
              grafo.AdicionarAresta(
                grafo.nomes[verticeSelecionado],
                grafo.nomes[verticeClicado],
                peso
              );
              redesenharTudo();
            } else {
              alert("Peso inválido!");
            }
          }
          verticeSelecionado = null;
        } 
        // Seleção inicial para aresta
        else {
          verticeSelecionado = verticeClicado;
          alert(`Vértice '${grafo.nomes[verticeSelecionado]}' selecionado. Clique em outro para conectar.`);
        }
      } 
      // Criação de novo vértice
      else {
        const nome = prompt("Nome do novo vértice:");
        if (nome && grafo.adicionarVertice(nome.trim(), x, y)) {
          redesenharTudo();
        }
      }
    });

    // Evento do botão: Gerar Matriz de Adjacência
    document.getElementById("btnMatriz").addEventListener("click", () => {
      grafo.gerarMatrizAdjacencia();
    });

    // Evento do botão: Encontrar Caminhos
    document.getElementById("btnCaminhos").addEventListener("click", () => {
      const origem = prompt("Vértice de origem:");
      const destino = prompt("Vértice de destino:");
      
      // Valida vértices
      if (!grafo.nomes.includes(origem) || !grafo.nomes.includes(destino)) {
        alert("Vértices inválidos!");
        return;
      }
      
      // Encontra caminhos
      const caminhos = grafo.encontrarTodosCaminhos(origem, destino);
      if (caminhos.length === 0) {
        alert("Nenhum caminho encontrado!");
        return;
      }
      
      // Calcula pesos dos caminhos
      const pesos = caminhos.map(caminho => {
        return caminho.slice(0, -1).reduce((total, vertice, i) => {
          const idx1 = grafo.nomes.indexOf(vertice);
          const idx2 = grafo.nomes.indexOf(caminho[i + 1]);
          return total + grafo.pesos[idx1][idx2];
        }, 0);
      });
      
      // Encontra caminhos extremos
      const minPeso = Math.min(...pesos);
      const maxPeso = Math.max(...pesos);
      caminhoMaisCurto = caminhos[pesos.indexOf(minPeso)];
      caminhoMaisLongo = caminhos[pesos.indexOf(maxPeso)];
      
      // Formata resultado
      let resultado = `Caminhos de ${origem} para ${destino}:\n\n`;
      caminhos.forEach((caminho, i) => {
        resultado += `• ${caminho.join(" → ")} (Peso: ${pesos[i]})\n`;
      });
      
      resultado += `\nCaminho mais curto: ${caminhoMaisCurto.join(" → ")} (Peso: ${minPeso})\n`;
      resultado += `Caminho mais longo: ${caminhoMaisLongo.join(" → ")} (Peso: ${maxPeso})`;
      
      document.getElementById("resultado").textContent = resultado;
      redesenharTudo();
    });

    // Evento do botão: Criar Grafo Manual
    document.getElementById("btnCriarManual").addEventListener("click", () => {
      const qtd = parseInt(prompt("Quantos vértices?"));
      if (isNaN(qtd) || qtd <= 0) {
        alert("Quantidade inválida!");
        return;
      }
      
      const vertices = [];
      for (let i = 0; i < qtd; i++) {
        const nome = prompt(`Nome do vértice ${i + 1}:`);
        if (!nome) {
          alert("Nome inválido!");
          return;
        }
        
        const arestas = [];
        while (true) {
          const conexao = prompt(`Conexões de ${nome} (deixe em branco para parar):`);
          if (!conexao) break;
          arestas.push(conexao.trim());
        }
        
        vertices.push({ nome: nome.trim(), arestas });
      }
      
      grafo.criarGrafoManual(vertices);
      caminhoMaisCurto = null;
      caminhoMaisLongo = null;
      redesenharTudo();
    });

    // Evento do botão: Carregar Exemplo
    document.getElementById("btnExemploDijkstra").addEventListener("click", () => {
      grafo.nomes = ["A", "B", "C", "D", "E", "F"];
      grafo.coordenadas = [
        { x: 150, y: 250 },  // A
        { x: 300, y: 150 },  // B
        { x: 300, y: 350 },  // C
        { x: 450, y: 150 },  // D
        { x: 450, y: 350 },  // E
        { x: 600, y: 250 }   // F
      ];
      
      // Reinicializa matrizes
      grafo.matriz = Array.from({ length: grafo.ordem }, () => 
        Array(grafo.ordem).fill(0)
      );
      grafo.pesos = Array.from({ length: grafo.ordem }, () => 
        Array(grafo.ordem).fill(0)
      );
      
      // Adiciona arestas com pesos
      grafo.AdicionarAresta("A", "B", 12);
      grafo.AdicionarAresta("A", "C", 4);
      grafo.AdicionarAresta("B", "C", 6);
      grafo.AdicionarAresta("B", "D", 6);
      grafo.AdicionarAresta("B", "E", 8);
      grafo.AdicionarAresta("C", "E", 2);
      grafo.AdicionarAresta("D", "F", 6);
      grafo.AdicionarAresta("E", "F", 6);
      
      caminhoMaisCurto = null;
      caminhoMaisLongo = null;
      redesenharTudo();
    });

    // Renderização inicial
    redesenharTudo();