# DataPack

DataPack allows for smart serialization and deserialization of binary data based on shared schemas for transmission over a network.


## Difference packing

DataPack attempts to pack data in the most efficient way possible by implementing difference checking and only sending data which has been updated since the last packet was sent. It does this by tracking what was sent to each client.

For instance in a multiplayer game, all objects would specify generic transform components for position, velocity, acceleration, and rotation. These objects would need to update each connected player over the network of their state, but to do this in an efficient manor we would only want to send this state to the player when the object state changes and only the specific components which changed.

## Usage

#### Define a Schema

Schemas allow us to specify the structure of the data for a specific
type. This might be an entity type in an entity-component-system. These schemas need be shared between your server and client or each peer in a peer to peer setup so that the serialized binary can be deserialized back into a JSON object.

```
  import { Schema, Component, Types } from 'datapack'

  // Define schema for each entity type
  const playerSchema = new Schema('player', [
    new Component('loc', Types.Array(Types.Float32)),
    new Component('vel', Types.Array(Types.Float32)),
    new Component('acc', Types.Array(Types.Float32)),
    new Component('rot', Types.Float32),
    new Component('health', Types.Uint8)
  ])
```

#### Add schemas to a DataPack

```
  import { DataPack } from 'datapack'

  const datapack = new DataPack([ playerSchema ])
```

### Serializing (writing a binary buffer)

```
  const items = [
    {
      schemaId: 1,
      uid: 1,
      loc: [0, 0],
      vel: [0, 0],
      acc: [0, 0],
      rot: 0,
      health: 100
    }
  ]

  const buffer = datapack.serialize(items)

```

### Deserializing (reading a binary buffer)

Assuming we have received the buffer on the client over the network and the client has the same set of schemas as the server we will be able to read back the binary buffer into a JSON object.

```
  const items = datapack.deserialize(buffer)

  // Merge deserialized buffer into state
  items.forEach(item => {
    Object.assign(state[item.uid], item)
  })  
```
