# Analisis de los datos de Berkely

# SERIES DE TIEMPO DE TEMPERATURAS
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

#####################################

spdf <- SpatialPointsDataFrame(coords = data.frame(lon, lat), data = data.frame(temperature = tem[,"jan_1930"]),
                               proj4string = CRS("+proj=longlat +datum=WGS84 +ellps=WGS84 +towgs84=0,0,0"))


source("https://gegp01.github.io/leafletR/toGeoJSON.R")
source("https://gegp01.github.io/leafletR/dfToGeoJSON.R")
source("https://gegp01.github.io/leafletR/fileToGeoJSON.R")
source("https://gegp01.github.io/leafletR/spToGeoJSON.R")

toGeoJSON(spdf, "temperaturas")
