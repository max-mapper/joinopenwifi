var iwlist = require('iwlist')

function JoinOpenWifi(iface, delay, silent) {
  this.iface = (iface || 'wlan0')
  this.tried = {}
  this.silent = silent
  this.delay = delay || 30000
  this.iw = iwlist(this.iface, this.delay, this.silent)
  // wait for some time so that linux can try to associate with a known network first
  if (!this.silent) console.log('waiting ' + this.delay/1000 + ' seconds')
  setTimeout(this.start.bind(this), this.delay)
}

module.exports = function(iface, delay, silent) {
  return new JoinOpenWifi(iface, delay, silent)
}

module.exports.JoinOpenWifi = JoinOpenWifi

JoinOpenWifi.prototype.start = function() {
  var self = this
  self.iw.associated(function(err, associated) {
    if (associated) {
      if (!self.silent) console.log('already associated -- exiting')
      return process.exit()
    }
    self.findOpenNetwork()
  })
}

JoinOpenWifi.prototype.findOpenNetwork = function() {
  var self = this
  if (!self.silent) console.log('scanning for open networks...')
  self.iw.scan(function(err, networks) {
    if (err) {
      if (!self.silent) console.log('error scanning', err)
      return process.exit()
    }
    networks = self.removeSecureNetworks(networks)
    if (networks.length === 0) {
      if (!self.silent) console.log('no open networks nearby')
      return process.exit()
    }
    var network = self.getNextNetwork(networks)
    if (!self.silent) console.log('attempting to join ' + network.essid)
    self.connectToNetwork(network.essid)
  })
}

JoinOpenWifi.prototype.connectToNetwork = function(essid) {
  var self = this
  this.tried[essid] = true
  self.iw.connect(essid, function(err) {
    if (err) {
      if (!self.silent) console.log('error joining ' + essid, err)
      return self.start()
    }
    self.iw.online(function(err) {
      if (err) {
        if (!self.silent) console.log(essid + ' is not internet enabled', err)
        return self.findOpenNetwork()
      }
      if (!self.silent) console.log('got online successfully via network: ' + essid)
      process.exit()
    })
  })
}

JoinOpenWifi.prototype.removeSecureNetworks = function(networks) {
  openNetworks = []
  networks.map(function(network) {
    if (!network.encrypted) openNetworks.push(network)
  })
  return openNetworks
}

JoinOpenWifi.prototype.getNextNetwork = function(networks) {
  var network = networks.shift()
  if (!network) return process.exit()
  while (this.tried[network.essid]) {
    network = networks.shift()
  }
  return network
}