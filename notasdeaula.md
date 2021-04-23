# MAC0420 - Introdução à Computação Gráfica

Oferecimento da disciplina no primeiro semestre de 2021, com o professor Carlos H. Morimoto, no Instituto de Matemática e Estatística da USP.

**Bibliografia:**

1. [Interactive Computer Graphics: a top-down approach with WebGL, Edward Angel, 7th edition](https://www.pearson.com/us/higher-education/product/ANGEL-Interactive-Computer-Graphics-A-Top-Down-Approach-with-Web-GL-7th-Edition/9780133574845.html). Existe uma 8a edição no formato eletrônico.
2. [Introduction to Computer Graphics, David J. Eck, Versão 1.2](http://math.hws.edu/graphicsbook/). Esse material está disponível para download e também ser apreciado online.
3. [Notas de aula de CMSC427 - Computer Graphics](http://www.cs.umd.edu/class/fall2013/cmsc427/) do professor [Dave Mount](http://www.cs.umd.edu/users/mount/).

**Avaliação:**

- Exercícios-programa
- Provinhas

## Introdução

**Objetivo:**

- Gerar imagens de objetos 3D usando um computador

- Fazer o computador ~~desenhar/pintar~~ renderizar

  ![Processo de renderização 3D](https://www.ime.usp.br/~hitoshi/mac420/figuras/renderizacao3D.png)

**Ferramentas:**

- WebGL

### Um pouco de história

- **Constrained-based drawing:** quadrado - posição e escala
- **Hierarchical model:** objetos e partes X imagens
- **Vector graphics:** descrições X imagens

#### Imagens raster x vetoriais

- Imagem *raster*: matriz de pontos (rasterização é quebrar a imagem em pixel)
- Imagem vetorial: lista de pontos

#### Sistemas gráficos

- monitores antigamente eram vetoriais (vector graphics)

- LCD: sistema gráfico *raster*

- **Um problema**
  
  - Traçar uma reta entre 2 pontos em um monitor com imagem *raster*
    - Falta de continuidade: problemas de *aliasing* (a reta na verdade se torna conjuntos de blocos, ou seja, pixels) -- problema de quantização
    - Esse problema pode ser resolvido se os pixels deixarem de ser binários e passam a ter níveis de cinza entre 1 byte
  - IDEIA: algoritmo de Bresenham, para linhas
  - Hipótese: $\theta < 45º$
  
  ```pseudocode
  f(x0, y0) = 0
  próximo ponto deve ser f(x0+1, y0) ou f(x0+1, y0+1)
  quanto vale f(x0+1, y0+1/2)?
  se positivo, próximo é y0+1
  caso contrário é y0
  
  para encontrar o meio: D = f(x0+1, y0+1/2) - f(x0, y0)
  se D < 0:
  	pinte (x0+1, y0)
  	D += A # soma dy
  senão:
  	pinte (x0+1, y0+1)
  	D += A + B # soma dy - dx
  ```
  
  O algoritmo só precisa de soma, subtração e *shift* (divisão por 2) -- é um algoritmo muito eficiente
  
- Sistema gráfico *raster* com processador gráfico

## O domínio da computação gráfica

![cg-visao-e-processamento](./img/dominio.jpg)

### Elementos gráficos

- **pixel** = *picture element*, é a unidade na qual trabalharemos
  - pode ter valor binário (0 | 1), cinza (1 byte, ou seja, [0,255]), ou cor
- **desenho** = formas geométricas, polilinhas -> **vetoriza**
  - linhas abertas 
  - linhas fechadas (polígono) --o conceito de dentro e fora
  - linhas podem se cruzar ou não
- **pintura** = nasce do polígono: pintar  que está dentro, ou pintar o que está fora, ou a borda -> **rasteriza**
  - pintar é modificar propriedades de elementos gráficos

### Informações da cena

![informacoes](./img/informacoes.jpg)

### A Câmera

- "Plano de imagem" -- a imagem está na câmera

![pinhole](./img/pinhole.jpg)

- Além da posição e da orientação, o **zoom** definido na câmera também modifica a imagem

- O **FOV** é inversamente proporcional ao comprimento focal e ao zoom

### A Imagem

- **W**idth: largura da imagem
- **H**eight: altura da imagem
- **W/H**: *aspect ratio*

- Pixel: profundidade
  - Número de bits
    - 1 bit - binária, 
    - 8 bits - cinza, 
    - 24 bits - RGB, 
    - 32 bits - RGBA  (canal alfa para opacidade ou profundidade)

### Cor

- Comprimento de onda (eletromagnética) ou partícula (fóton) 
- Percepção - constância de cor

* *Halftoning* - impressoras

![img](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Halftoningcolor.svg/408px-Halftoningcolor.svg.png)