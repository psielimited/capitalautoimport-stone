var Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
var _ = require('lodash');
var keystone = require('keystone');
var request = require('request');
var path = require('path');
var fs = require('fs');
// Download images into temp direcotry
var download = function (uri, callback) {
    request.head(uri, function (err, res, body) {
        var contentType = res.headers['content-type'];
        var filename = path.basename(uri);
        var filepath = path.join(__dirname, "temp") + '/' + filename;

        request(uri).pipe(fs.createWriteStream(filepath)).on('close', function () { callback(filepath) });
    });
};

var run = function* (batch_id, ad, website) {
    var images = [];
    
    //open headless browser
    var nightmare = Nightmare({ show: false });
    yield nightmare
        .useragent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:56.0) Gecko/20100101 Firefox/56.0')
        .viewport(1000, 800)
        .goto(website.loginUrl)
        .wait('input#username')
        .type('input#username', website.username)
        .type('input#password', website.password)
        .click('input[type="submit"]')
        .wait(3000)
        .catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    // navigate to create page    
    yield nightmare
        .wait('#CreateLink')
        .click('#CreateLink')
        .wait('#BrandModelControl')
        .wait(2000)
        .catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    
    // Fill infomration    
    yield nightmare.select('#Year', ad.ano).wait(1000);
    //select Brand/Model        
    yield nightmare.wait(2000)
        .click('input#BrandModelControl')
        .type('input#BrandModelControl', ad.marca + ' ' + ad.modelo)
        .wait('#BrandModelControlAutoCompleteList ul li')
        .click('#BrandModelControlAutoCompleteList ul li:nth-child(1) a')
        .wait(2000)
        .catch(function (error) {
            nightmare.end();
            console.log(error);
        });

    //select condition
    var conditionValue = yield nightmare.evaluate(function (condition) {
        return $('#Condition option:contains("' + condition + '")').val();
    }, ad.condicion);
    yield nightmare.select('#Condition', conditionValue)
        .wait(1000)
        .catch(function (error) {
            nightmare.end();
            console.log(error);
        });

    //select currency
    var currencyValue = yield nightmare.evaluate(function (currency) {
        return $('#Currency option:contains("' + currency + '")').val();
    }, ad.moneda)
    yield nightmare.select('#Currency', currencyValue)
        .wait(500)
        .catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    yield nightmare
        .click('input#PriceVisible')
        .evaluate(function () {
            document.querySelector('input#PriceVisible').value = ''
        })
        .type('#PriceVisible', ad.precio)
        .wait(500)
        .catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    //colors
    if (ad.color_exterior) {
        var extColorValue = yield nightmare.evaluate(function (extColor) {
            return $('#ColorExterior option:contains("' + extColor + '")').val();
        }, _.startCase(_.lowerCase(ad.color_exterior)));
        yield nightmare.select('#ColorExterior', extColorValue)
            .wait(600)
            .catch(function (error) {
                nightmare.end();
                console.log(error);
            });
    }

    if (ad.color_interior) {
        var intColorValue = yield nightmare.evaluate(function (intColor) {
            return $('#ColorInterior option:contains("' + intColor + '")').val();
        }, _.startCase(_.lowerCase(ad.color_interior)));
        yield nightmare.select('#ColorInterior', intColorValue)
            .wait(600)
            .catch(function (error) {
                nightmare.end();
                console.log(error);
            });
    }


    //fuel type
    if (ad.tipo_combustible) {
        var fuelTypeValue = yield nightmare.evaluate(function (fuelType) {
            return $('#Fuel option:contains("' + fuelType + '")').val();
        }, ad.tipo_combustible);
        yield nightmare.select('#Fuel', fuelTypeValue).wait(600).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    // transmission type
    if (ad.tipo_transmision) {
        var transTypeValue = yield nightmare.evaluate(function (transType) {
            return $('#Transmission option:contains("' + transType + '")').val();
        }, ad.tipo_transmision);
        yield nightmare.select('#Transmission', transTypeValue).wait(600).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    //Traction type
    if (ad.tipo_traccion) {
        var tractionTypeValue = yield nightmare.evaluate(function (tractionType) {
            return $('#Traction option:contains("' + tractionType + '")').val();
        }, ad.tipo_traccion);
        yield nightmare.select('#Traction', tractionTypeValue).wait(600).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }
    // Engine Type 
    if (ad.engineType) {
        var engineTypeValue = yield nightmare.evaluate(function (engineType) {
            return $('#EngineType option:contains("' + engineType + '")').val();
        }, ad.engineType);
        yield nightmare.select('#EngineType', engineTypeValue).wait(600).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }
    // Cylinders
    if (ad.cylinders) {
        yield nightmare.select('#Cylinders', ad.cylinders).wait(600).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }
    // cc
    if (ad.engine_value) {
        yield nightmare.type('#Engine', ad.engine_value).wait(400).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    // Mileage Unit
    if (ad.mileageUnit) {
        yield nightmare.select('#MileageUnit', ad.mileageUnit).wait(800).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    // Mileage
    if (ad.mileage) {
        yield nightmare.evaluate(function () {
            document.querySelector('input#Mileage').value = ''
        })
            .type('#Mileage', ad.mileage).wait(700).catch(function (error) {
                nightmare.end();
                console.log(error);
            });
    }

    //Load Capacity
    if (ad.cargoUnit) {
        yield nightmare.select('#CargoUnit', ad.cargoUnit);
    }
    if (ad.cargoUnit_value) {
        yield nightmare.evaluate(function () {
            document.querySelector('input#Cargo').value = ''
        })
            .type('#Cargo', ad.cargoUnit_value).wait(800).catch(function (error) {
                nightmare.end();
                console.log(error);
            });
    }
    // Passengers
    if (ad.passengers) {
        yield nightmare.select('#Passengers', ad.passengers).wait(500).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }
    // doors
    if (ad.doors) {
        yield nightmare.select('#Doors', ad.doors).wait(1000).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    // Internal Use Data
    if (ad.codigo_interno) {
        yield nightmare.type('#InternalCode', ad.codigo_interno).wait(800).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }
    if (ad.comentarios_uso_interno) {
        yield nightmare.type('#InternalObservations', ad.comentarios_uso_interno).wait(800).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    // description 
    if (ad.description) {
        yield nightmare.type('#Description', ad.description).wait(800).catch(function (error) {
            nightmare.end();
            console.log(error);
        });
    }

    //Components
    for (const component in ad) {
        if (_.startsWith(component, 'Components')) {
            if (ad[component]) {
                yield nightmare.check('#' + component);
            }
        }
    }

    //publish ad TODO: Enable check after Testing completed. Keep ads disabled for testing
    //if (ad.disabled) {
    yield nightmare.check('#Disabled');
    //}
    //submit form
    yield nightmare.click('#SubmitLink').wait(2000);

    //check for error
    let hasError = yield nightmare.visible('.TopValidationContainerRed');
    if (hasError) {
        let errors = yield nightmare.evaluate(function () {
            return $('#TopValidationMessages').text();
        });
        console.log('Validation errors: ' + errors);
    }
    
    //mark as published 
    let success = yield nightmare.visible('#LogoUpload');
    
    if (success) {
        //get id of ad
        let ad_uri = yield nightmare.evaluate(function(){
            return document.URL;
        });
        let ad_id = path.basename(ad_uri.split("?").shift());
        keystone.list('PublishAds').model.update(
            { _id: batch_id },
            {
                $set: {
                    'webProperty_supercarros': true,
                    'status': 'Publicado',
                    'supercarros_ad_id': ad_id
                }
            }, {
                'multi': false
            }).exec(function (err, effectedRows) {
                console.log(effectedRows);
            });
    }else{
        console.log('Existing site. seems validation error occurred.');
        yield nightmare.end();
        // mark invalid to advert
        keystone.list('PublishAds').model.update(
            { _id: batch_id },
            {
                $set: {                    
                    'status': 'Inválido'                    
                }
            }, {
                'multi': false
            }).exec(function (err, effectedRows) {
                console.log(effectedRows);
            });
        return {error: true}
    }
    //Download images
    yield new Promise(function (resolve, reject) {
        for (let image of ad.image) {
            download(image.url, function (filepath) {
                images.push(filepath);
            });
        }
        resolve({ success: true })
    });


    //Download images for attached gallary
    yield keystone.list('Gallery').model.findOne()
        .where('_id', ad.gallery)
        .exec()
        .then(function (gallery) {
            if(typeof gallery.heroImage.url !== 'undefined'){
                download(gallery.heroImage.url, function (filepath) {
                    images.push(filepath);
                });
            }
            
            for (let image of gallery.images) {
                download(image.url, function (filepath) {
                    images.push(filepath);
                });
            }
        }, function (err) {
            throw err;
        });
    yield nightmare.wait(5000);

    //upload images on suppercarros
    if(images){        
        console.log('Uploading images...')
        yield nightmare
        .wait(3000)
        .wait('#LogoUpload input[type="file"]')
        .upload('#LogoUpload input[type="file"]', images)
        .wait(2000)
        .catch(function (err) {
            console.log(err);
        });
    }
    
    let hasImageUploaded = yield nightmare.visible('.PhotoEditList');
    if(hasImageUploaded){
        console.log('images uploaded');
    }
    // kill headless browser 
    yield nightmare.wait(2000).end();
    return {success: true}

}
module.exports = run;