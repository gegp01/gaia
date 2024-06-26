# Analyzing spatial structure in the Ising model of criticality

Gabriel E García Peña <br>
Centro de Ciencias de la Complejidad <br>
Universidad Nacional Autonoma de México <br>

Spatial autocorrelation is commonly analyzed with the Moran Index. However, calculating Moran´s Index may be computationally challenging, as all combinations of locations must be evaluated. 

In this repository, I present:
(1) a method to calculate Morans Index in large datasets, that are too big to be calculated with a standard distance matrix, e.g. by using the dist() R function. 
(2) The use of this method to estimate Morans Index in the criticality model of Ising. 

Overall, the analysis presented suggests that Morans index is maximum at the critical point of the Ising model.

#### For Ising 100 x 100, we compared the estimates of I with our code and the moransI() function in lctools.

<img src="compare_Icode_lctools.png"/>

The estimated values of I are consistent between methods (our code vs. lctools). The Ising image at the middle of the panel, is the critical point at 2.69°C, and has the highest Morans Index than the other two images of Ising outside the critical point; consistently, the index decreases towards 0.

Our method allows calculating the Morans Index for a large matrix of 500 x 500, without saturating the RAM; whereas the method in lctools saturates computers RAM. 



## Moran's Index (<i>I</i>)

The index estimates the spatial structure in the Data, i.e. how likely is to predict the value of an spatial observation with values of the neighbours arround the observation. This index is calculated as the ratio of the number of observations (N) divided by the Weights (W) indicating whether an observation should be accounted for in the calculation of I or not:

$$  <i>I = {N\over W} {A \over B} </i> $$

$$ <i>N</i> = samples $$

$$ W = {\sum_{i=1}^{N} w_{ij}} $$

$$ A = {\sum_{i=1}^N \sum_{j=1}^N w_{ij} z_i z_j } $$

$$ B = {\sum_{i=1}^{N} z_i²} $$

$$ z_i = x_i - \overline{x} $$

$$ z_j = x_j - \overline{x} $$


<a href ="http://lctools.science/lctools/" target="_blank">Stamatis Kalogirou</a> is the author of the function <i>moransI()</i> that calculates Moran Index in the R library <b>lctools</b>. In this function the weight matrix W is defined as 1 minus the euclidean distance between a pair of observations, divided by an arbitrary maximum distance (<i>H</i>). Values > <i>H</i> are considered as 0.

$$ (1-({dist_{ij} \over H})²)² $$

Here, we will consider the distance between each pair of points ($dist_ij$) as the Manhatan distance: 

$$ |lat_i - lat_j| + |lon_i - lon_j| $$  

<br><br>

<div align = "center">
 <img src="checker_matrix.png" height = 300 width = 300> <img src="random_matrix.png" height = 300 width = 300> <img src="nested_matrix.png" height = 300 width = 300>
</div>

Moran Index can have values of -1 to 1; and departs from zero when data is not random and has spatial structure. Structure can be either anticorrelated (-1) or correlated (1).

</br></br>

## Assesing spatial structure in the Ising model
<div align = "center">
  <img src="T2_269.jpeg" height = 500 width = 500>
</div>

```
  path2ising = "~/gaia/DATA/ising_grids/"
  fls = list.files(path2ising)
```

### Assigning the maximum distance between neighbors

The maximum distance between neighbours (H) defined to calculate the weights matrix (W), influences the value of I. As <i>H</i> increases <i>I</i> decreases. 

<div align = "center">
  <img src="I_bandwith_plot.jpeg" height = 500 width = 500>
</div>


## The weight matrix. 

<div>The weight matrix in lctools (with Bandwidth = 4) is represented by a matrix with zeros in the diagonal and in all pairs of observations (ij) separated by a distance larger that <i>H</i>.

<div align = "center">
  <img src="weights_lctools_matrix.png" height = 500 width = 500>
</div>
</div>

The weight matrix grows exponentially as data accumulates and thus can be a very large. For a random 5 x 5 Matrix, calculating manhattan distance between each pair of observations results in a weights matrix of 25 x 25 pairs of observations (ij).

<div align = "center">
 <img src="weights_matrix.png" height = 500 width = 500>
</div>


### A method for Analizing a Large Matrix
Analyses of Distance are fundamental to investigate phylogenetics, networks and geographic correlations. This requires analyzing a matrix of distances between elements (ij); a matrix that can be large and computers struggle in storing and handling it in RAM. For example, this limits are reached when analyzing an Ising model of 500 rows x 500 columns. In this matrix there are 250 000 elements, and the distance matrix required is 250 000 x 250 000. 

A normal function such as <i>dist()</i> would saturate computers memory. Hence large matrices must be analized element by element. Here is a code to do such task, calculating Moran´s Index.

```
# LIBRARIES
require(stringr)

# DATA.
# For this example, we can build a random matrix of 500 x 500 filled with 0s and 1s.
DATA = matrix(nrow=500, ncol=500, data=rbinom(size = 1, n = 250000, prob = 0.5))

# REDUCE THE MATRIX TO STRINGS

f.data = function(x){
       paste(D[,x], collapse='')}

D = sapply(1:nrow(DATA), f.data)

# D is a vector of 1 x 500, with strings with 500 caracters, either 0 or 1.

# An element in D can be found with the coordenates y(row) and x(column)
# For example, to finding the element in the coordinates y and x
y = 3 # row (latitude)
x = 2 # column (longitude)
  
xy = str_sub(D[y], x, x)

# There are 500 x 500 elements in the matrix D, and these can be found with a function f.yx.

f.yx = function(yx){
  y = yx[1]
  x = yx[2]
  str_sub(D[y], x, x)
}


# For the combinations of coordinates yx
yx = combn(1:500, 2) # Nota that these are coordinates of the half of the matrix. Pairs of elements are considered symetric ij = ji. Hence we just analyse the half of the combinations ij

# For further analyses we give a unique name to each element
colnames(yx)<-paste("ix", 1:ncol(yx), sep = "_")

# Lets call a pair of elements i,j from D
i = f.yx(yx[,1])
j = f.yx(yx[,2])

# Are they equal?
j == i
```

##### DEFINING THE WEIGHT MATRIX Wij of D
In the Moran index, only the pair of elements that are determined by the weight matrix are used to calculate the index. Thus we only need to find these elements.

```
# MANHATTAN DISTANCE
# HAY 500 x 500 elementos en la matriz D
# uno de esos 25000 elementos xy pueden encontrasrse con la funcion de f.yx

f.yx = function(yx){
  y = yx[1]
  x = yx[2]
  str_sub(D[y], x, x)
}

# FOR ALL ONE SIDE COMBINATIONS OUTSIDE THE DIAGONAL
# TO ADD DIAGONAL: yx_ = cbind(t(cbind(1:5, 1:5)), yx)

yx = combn(1:500, 2)
colnames(yx)<-paste("ix", 1:ncol(yx), sep = "_")

# DEFINE THE WEIGHT MATRIX W WITH MANHATTAN DISTANCE
# H is the maximum distance of the neighbors
H = 3

# Function for estimating the zi and zj values where wij is not 0.
# Multiplying wij*zi*zj will be 0 for all of them and they will not contribute to the sum in the numerator.
  
f0 = function(x){
  f.dif = function(x){
    yx[,-x]-yx[,x]
  }

  s = f.dif(x)
  
  n = ncol(s)
  a = NULL

  for(i in 1:n){
    a[i] = sum(abs(s[,i]))
    }
  yx[,colnames(s[,a<H])]
  }

# This will generate Y, a list with data for half of the elemtns off diagonal that are meaningfull (wij != 0).  
# The process can be partitioned with Y = lapply(1:100000, f0)

Y = lapply(1:(ncol(yx)-1), f0) 

f1 = function(x){
  b = NULL
  for(i in 1:ncol(Y[[x]])){
    b[i] = f.yx(Y[[x]][,i])
    }
  xi = as.numeric(f.yx(yx[,x]))
  zi = xi-0.5
  zj = as.numeric(b)-0.5
  zizj = zj * zi
  list(zizj, zi*zi)
}

Z = lapply(1:length(Y), f1)  

f.denom = function(x){Z[[x]][[2]]}
Zi = unlist(lapply(1:length(Z), f.denom))  

denom = sum((Zi*2))  # multiply for 2 because we are only analysing the half of the matrix.

f.num = function(x){Z[[x]][[1]]}
WijZiZj = unlist(lapply(1:length(Z), f.num))

numer = sum(rep(WijZiZj, 2))

W = length(WijZiZj)*2  # assuming that weight is binay (either 1 or 0)
N = (length(D)*length(D))

I = (N/W)*(numer/denom)  
I

```

#### For Ising 100 x 100, compare the estimates of I with our code and the moransI() function in lctools.

<img src="compare_Icode_lctools.png"/>

The estimated values of I are consistent between methods (our code vs. lctools). The Ising image at the middle of the panel, is the critical point at 2.69°C, and has the highest Morans Index than the other two images of Ising outside the critical point; consistently, the index decreases towards 0.

Our method allows calculating the Morans Index for a large matrix of 500 x 500, without saturating the RAM; whereas the method in lctools saturates computers RAM. 

## Spatial structure of local air temperatures.

#### Is there spatial structure of temperature across the world?

Morans Index across time global, in land, and at sea...


#### Are linked systems loosing their structure?

PCA ANALYSIS





















