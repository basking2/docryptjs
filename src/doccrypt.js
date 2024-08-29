const { isTypedArray } = require('node:util/types')

crypto = require ('node:crypto')

class DocCrypt {
    constructor(parameters = {}) {
        this.keylength = parameters['keylength'] || 32
        this.ivlength = parameters['ivlength'] || 16
        this.algorithm = parameters['algorithm'] || 'aes-256-cbc'
    }

    static getCiphers() {
        return crypto.getCiphers()
    }

    static salt(len) {
        return crypto.randomBytes(len).toString('hex');
    }

    /**
     * A factory method.
     * @returns A DocCrypt object that uses the AES-256-CBC cipher.
     */
    static aes256cbc() {
        return new DocCrypt({
            keylength: 32,
            ivlength: 16,
            algorithm: 'aes-256-cbc'
        })        
    }

    static async key(password, salt, keylength) {
        return new Promise((resolve, reject) => {
            crypto.scrypt(password, salt, keylength, (err, buff) => {
                if (err) {
                    return reject(err)
                } 

                resolve(buff)
            })
        })
    }

    static async iv(ivlength) {
        return new Promise((resolve, reject) => {
            crypto.randomFill(new Uint8Array(ivlength), (err, iv) => {
                if (err) {
                    return reject(err)
                }

                resolve(iv)
            })    
        })
    }

    
    async encryptString(password, salt, text, encoding = 'hex') {
        const key = await DocCrypt.key(password, salt, this.keylength)
        const iv = await DocCrypt.iv(this.ivlength)
        const cipher = crypto.createCipheriv(this.algorithm, key, iv)

        let ciphertext = cipher.update(text, 'utf8', encoding)
        ciphertext += cipher.final(encoding)
        return Promise.resolve({ciphertext, iv: [ ... iv.values()], encoding})
    }


    /**
     * Decrypt a string. The single has argument takes the following values.
     * 
     * * key - a key as a ByteBuffer, if the user has one. This is optional.
     * * password - A string, used with the salt, to generate the key.
     * * salt - A string, used with the password, to generate the key.
     * * encoding - A string describing the encoding of the cipher text.
     * * ciphertext - A string of text generated by a method such as encryptString().
     * 
     * @param {Object} param0 
     * @returns Object.
     */
    async decryptString({key, iv, password, salt, encoding, ciphertext}) {

        if (!key) {
            key =  await DocCrypt.key(password, salt, this.keylength)
        }

        iv = new Uint8Array(iv)
    
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
        try {
            let decrypted = decipher.update(ciphertext, encoding, 'utf8')
            decrypted += decipher.final('utf8')
            return Promise.resolve(decrypted)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}

module.exports = {
    DocCrypt
}