require(ncdf4)
path2temp<-"/media/gegp/DATA/gaia/temperatures/Land_and_Ocean_EqualArea.nc"
nc <- nc_open(path2temp)

lon <- ncvar_get(nc, "longitude")
lat <- ncvar_get(nc, "latitude")
TIME <- ncvar_get(nc, "time")
tem <- ncvar_get(nc, "temperature")
climatology = ncvar_get(nc, "climatology")
nc_close(nc)

# ASSIGN NAMES
month = rep (c("jan", "feb", "mar", "apr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dec"), 166)
#year = sort(rep(1850:2015, 12))
year = sort(rep(1850:(1850+round(ncol(tem)/12, 0)), 12))
month.yr =  paste(month, year, sep="_")

colnames(tem) = month.yr[1:ncol(tem)]
row.names(tem) = paste(lon, lat, sep="_")

#library(rjson)
#toJSON(setNames(y, names(y)))

# Read Data Interpolated at -10 and +10 yrs interval.

Z10 = readRDS("~/gaia/figures/Berkeley_filled_progressively_with_10yrs.rds")

# MAP OF NAs

M = ifelse(is.na(Z10), 1, 0)

require(sf)
require(sp)
require(raster)
require(graticule)
iso3 = read_sf(dsn = "~/sandbox/AMR/countries.geojson")
land <- as_Spatial(iso3)

#l2 <- spTransform(land, CRS("+proj=robin +lon_0=0w"))
#l3 <- spTransform(land, CRS("+proj=laea +lat_0=0 +lon_0=0 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs "))

rownames(M) = paste(lat, lon, sep=";")
summary(rowSums(M))

m = M[rowSums(M)>1,]

m.nms = do.call(rbind, strsplit(rownames(m), ";"))
m.lat = as.numeric(m.nms[,1])
m.lon = as.numeric(m.nms[,2])

alpha = rowSums(m)/max(rowSums(m))

png("~/gaia/figures/map_gaps_in_time_series_filled_Z10.png", height=900, width=900)
par(cex.lab=1.3, cex=1.3)
plot(lon, lat, col = rgb(1,0,0,alpha), type="n", axes=F, xlab="° longitude", ylab="° latitude")
plot(land, add=T, col = "beige", border="beige")
points(m.lon, m.lat, col = rgb(1,0,0,alpha), cex=1.3, pch=15)

axis(1)
axis(2)
title(main="Gaps in the time series from 1850 to 2023 \n progressive interpolation at 110 yr period", font.main = 3)

g = as.integer(quantile(c(rowSums(m)))[c(2,4)])
G = g/max(g)
legend("left", title = "NAs", legend= g, fill = rgb(1,0,0,G), cex = 1.1
       , border="lightgrey", bg =rgb(1,1,1,0.8), box.lwd = 0, inset=0.05)

dev.off()

################## USE INTERPOLATED DATA Z10 TO:
# (1) ARE POLYGOINS CORRELATED? 
#   + COMPARE CORRELATIONS OF TEMPERATURE BETWEEN IPCC POLYGONS.

# Cross data with IPCC polygons
# READ BERKELEY DATA (curated)
D = readRDS("~/gaia/figures/Berkeley_filled_progressively_with_10yrs.rds")

# READ CLIMATIC MODES and classify locations (lat,lon) based on the polygons
require(sf)
library(geojsonsf)

require(sp)
require(raster)
require(graticule)
iso3 = read_sf(dsn = "~/sandbox/AMR/countries.geojson")
land <- as_Spatial(iso3)

load(file="~/gaia/climate_modes/IPCC-WGI-reference-regions-v4_R.rda")
X = st_as_sf(IPCC_WGI_reference_regions_v4)

z = as(X, 'Spatial')

locations = data.frame(lon, lat)
obs = st_as_sf(locations, coords = c("lon","lat"), remove = FALSE)

# RUN THIS CODE TO INTERSECT DATA AS Y, OR LOAD RDA FILE TO GET Y.
#st_crs(obs) = st_crs(X)
#Y = st_intersection(X, obs)


## READ ZONES and data
require(sf)
load("~/gaia/climate_modes/obs_modes.rda")
class(Y)

nms = unique(paste(Y$lon, Y$lat))
D = Y[match(nms, paste(Y$lon, Y$lat)),]
st_geometry(D) <- NULL
zone = D$Acronym

# RUN PCA WITH SUBSETS
library(FactoMineR)
library(corrplot)
library(ggcorrplot)













