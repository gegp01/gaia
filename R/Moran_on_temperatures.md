#### Global Analysis of Air Temperatures

##### Data
~~~
# SERIES DE TIEMPO DE TEMPERATURAS
require(raster)
require(sp)
require(ncdf4)
require(sf)
require(terra)
#require(rgdal)

path2temp<-"/media/gegp/DATA/gaia/temperatures/Land_and_Ocean_EqualArea.nc"
nc <- nc_open(path2temp)

lon <- ncvar_get(nc, "longitude")
lat <- ncvar_get(nc, "latitude")
t <- ncvar_get(nc, "time")

tem <- ncvar_get(nc, "temperature")
nc_close(nc)

# SERIES DE TIEMPO DE TEMPERATURAS
year = 851:2015

# repetir los datos en secma
nms.t = do.call(rbind, strsplit(as.character(t), ".", fixed= T))[,1]
nms = nms.t[as.numeric(nms.t)<=2015]

temperature = tem
#tem= NULL

ix = as.numeric(nms.t)<=2015
temp.1850to2015 = temperature[,ix] 

y = sort(rep(1850:2015,12))
ix.sample = is.na(match(y, c(1865, 1915, 1965, 2015)))==F
Y = temp.1850to2015[, ix.sample]
~~~


# Land-sea mask
~~~
require(sf)
require(sp)
require(raster)
iso3 = read_sf(dsn = "~/sandbox/AMR/countries.geojson")
land <- as_Spatial(iso3)
~~~







