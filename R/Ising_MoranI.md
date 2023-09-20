# This script is used to analyze spatial structure in the Ising model of criticality.

# ISING MODEL DATA

```
  path2ising = "~/gaia/DATA/ising_grids/"
  fls = list.files(path2ising)
```


# Check data set
```
readLines(paste(path2ising,fls[1], sep = ""), n=10)
T1.500 = read.table(paste(path2ising,fls[1], sep = ""),header=F, skip=1)
T2.269 = read.table(paste(path2ising,fls[2], sep = ""),header=F, skip=1)
T3.500 = read.table(paste(path2ising,fls[3], sep = ""),header=F, skip=1)

VT1 = c(as.matrix(T1.500))
VT2 = c(as.matrix(T2.269))
VT3 = c(as.matrix(T3.500))

lat.vt1 = rep(1:100, 100)
lon.vt1 = sort(rep(1:100, 100))

M.T1.BISQ = lctools::moransI(cbind(lon.vt1, lat.vt1), 8, VT1, WType ="Bi-square")
M.T1.BISQ.20 = lctools::moransI(cbind(lon.vt1, lat.vt1), 20, VT1, WType ="Bi-square")
M.T1.BISQ.50 = lctools::moransI(cbind(lon.vt1, lat.vt1), 50, VT1, WType ="Bi-square")
M.T1.BISQ.1000 = lctools::moransI(cbind(lon.vt1, lat.vt1), 1000, VT1, WType ="Bi-square")
M.T1.BISQ.9999 = lctools::moransI(cbind(lon.vt1, lat.vt1), 9999, VT1, WType ="Bi-square")

M.T2.BISQ = lctools::moransI(cbind(lon.vt1, lat.vt1), 1000, VT2, WType ="Bi-square")
M.T3.BISQ = lctools::moransI(cbind(lon.vt1, lat.vt1), 1000, VT3, WType ="Bi-square")
```

#saveRDS(list(M.T1.BINOM, M.T1.BISQ.50, M.T1.BISQ.1000, M.T1.BISQ.10000), "moran_T1.5.rds")

# Graph results

M.T1 = M.T1.BISQ.1000

jpeg("ising_T1.5_10000neighbors.jpeg")
pal <- colorRampPalette(c("black", "azure"))
image(M.T1$W, col = pal(5))
title(main=c("p =", round(M.T1$p.value.randomization), 3))
dev.off()

jpeg("ISING.jpeg")
par(mfrow=c(2,3))
image(as.matrix(T1.500), col=c(0,1))
title(main = paste("Moran", round(M.T1.BISQ$Morans.I, 3)),
      sub = paste("Z =", round(M.T1.BISQ$z.randomization, 3)
                  , "\n p =", round(M.T1.BISQ$p.value.randomization, 3)))

image(as.matrix(T2.269), col=c(0,1))
title(main = paste("Moran", round(M.T2.BISQ$Morans.I, 3)),
      sub = paste("Z =", round(M.T2.BISQ$z.randomization, 3)
                  , "\n p =", round(M.T2.BISQ$p.value.randomization, 3)))


image(as.matrix(T3.500), col=c(0,1))
title(main = paste("Moran", round(M.T3.BISQ$Morans.I, 3)),
      sub = paste("Z =", round(M.T3.BISQ$z.randomization, 3)
                  , "\n p ~", round(M.T3.BISQ$p.value.randomization,4)))

dev.off()
