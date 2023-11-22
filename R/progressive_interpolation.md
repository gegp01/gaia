### Progressive Interpolation of Missing Data

Global time series are often incomplete, hence missing data must be infered before performing analyses like Principal Components and Singular Value Decomposition.
Here, a progessive interpolation is implemented on the Global time series of air temperatures reported by Berkeley Earth (https://berkeleyearth.org/data/).

##### (1) Read data from ncdf file, quantify and visualize missing data.
~~~
# R code
# R libraries
require(ncdf4)

# Path to Berkeley Earth data.
path2temp<-"/media/gegp/DATA/gaia/temperatures/Land_and_Ocean_EqualArea.nc"

nc <- nc_open(path2temp)
lon <- ncvar_get(nc, "longitude")
lat <- ncvar_get(nc, "latitude")
time <- ncvar_get(nc, "time")
tem <- ncvar_get(nc, "temperature")
climatology = ncvar_get(nc, "climatology")
nc_close(nc)

# Assign names to data, with month year.
month = rep (c("jan", "feb", "mar", "apr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dec"), 166)
year = sort(rep(1850:(1850+round(ncol(tem)/12, 0)), 12))
month.yr =  paste(month, year, sep="_")
colnames(tem) = month.yr[1:ncol(tem)]
row.names(tem) = paste(lon, lat, sep="_")

# Check how many data are missing (herein NA)  
y = table(is.na(tem))
y[1]/sum(y)

f.na = function(x){
  q = table(is.na(TEMP[,x]))
  false = q[1]
  true = q[2]
# CUANDO NO HAY VALOR (is.na = 0, o al reves), LA TABLA NO ES EXPLICITA, ASI ES QUE HAY QUE DEFINIRLO COMO 0!
#  true  = ifelse(is.na(true), 0, true)
#  false  = ifelse(is.na(false), 0, false)
  cbind(false, true)
}

TEMP = tem
nas = do.call(rbind, lapply(1: ncol(TEMP), f.na))
par(mai =c(1,1,1,1))
hist(nas[,2]) 

M = ifelse(is.na(TEMP), 1, 0)
png("~/gaia/figures/gaps_in_time_series.png", height=450, width=450)
image(M, col= c("lightgreen", 1), axes=F)
text(0.05,0.9, "1850", cex=1)
text(0.95,0.9, "2023", cex=1)
title(xlab=paste(ncol(M), "monthly records")
      , ylab= paste(nrow(M), "locations {°lat,°lon}"), line = 1
      , main = "Gaps in Monthly Temperatures from 1850 to 2023, \n Berkeley Earth", font.main=3)
legend("left", inset = 0.05, legend = c("NA", "datum"), fill = c("black", "lightgreen")
       , border="lightgrey")
dev.off()
 ~~~
##### Missing data in Berkeley Earth data.
<div align=center>
  <img src="figures/gaps_in_time_series.png", height = 400>
  <img src="figures/map_gaps_in_time_series.png", height = 400>
</div>




