### Requirements
1. search
   - hybrid search
     - [x] full-text search
     - [x] vector search
   - [x] display pdf file
2. community
   - [x] newfeeds
   - interact with posts ***(authenticated)***
     - [x] like
     - [x] comment
     - [ ] share
   - [x] post content ***(authenticated)***
     - [x] toxic content detection
     - [x] images
3. assistant ***(authenticated)***
   - [x] question & answer
   - [x] conversations
   - [ ] clickable citation
4. map
   - [x] navigation
   - [x] available area: instant response
   - unavailable area ***(authenticated)***
     - [ ] create inference request
   - [x] analysis
5. user profile
   - [x] follower, following
   - [x] contacts
   - [x] posts
   - [ ] following button

### Prerequisites
1. azure services
   - [x] azure blob storage
   - [x] azure cosmos
   - [x] azure ai search
   - [x] azure foundry
2. google cloud services
   - [x] google earth engine: non-comercial plan
   - [x] google storage: east-us bucket 
3. search
   - azure blob storage
     - [x] create container
     - [x] upload documents
   - azure foundry
     - [x] deploy a text embedding model
4. community
   - azure cosmos
     - [x] create database: vinacarbon
     - [x] create container: posts
        - partition: /id
        - full-text-search: /content
5. assistant
   - azure foundry
     - [x] create agent
       - meta: name, description, starter prompt
       - instructions
       - tool = file search
        - [x] upload documents
6. map
   - [x] collect data
     - [x] sample data
       - footprints: Vietnam-2024
       - patches: footprints >= 10%
     - [x] group patches by region
     - [x] download patches: sen1, sen2-10m, sen2-20m, sen2-60, gedi-agbd
   - [x] train model
   - [x] validation
   - [x] inference